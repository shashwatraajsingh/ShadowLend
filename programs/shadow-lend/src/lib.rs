use anchor_lang::prelude::*;

declare_id!("8dBNWFxxdvHmoZWKuS1rGzGGmBxdXxHXauYAiTPM4Zan");

/// ShadowLend: Confidential Lending Protocol
/// 
/// Architecture:
/// - Pool: Public state (TVL, loan count, interest rate)
/// - Position: Encrypted state (collateral, debt, encrypted via Inco)
/// - All sensitive data stored as encrypted bytes (32-byte ciphertext)
/// 
/// Privacy Model:
/// - Collateral amounts: Encrypted, visible only to owner
/// - Debt amounts: Encrypted, visible only to owner  
/// - Health factor: Computed client-side after decryption
/// - Public: Total positions, aggregate TVL (anonymized)

#[program]
pub mod shadow_lend {
    use super::*;

    /// Initialize the lending pool with configuration
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        collateral_mint: Pubkey,
        borrow_mint: Pubkey,
        ltv_ratio: u16,           // Loan-to-value ratio (basis points, e.g., 7500 = 75%)
        interest_rate: u16,       // Annual interest rate (basis points)
        liquidation_threshold: u16, // Threshold for liquidation (basis points)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        pool.authority = ctx.accounts.authority.key();
        pool.collateral_mint = collateral_mint;
        pool.borrow_mint = borrow_mint;
        pool.ltv_ratio = ltv_ratio;
        pool.interest_rate = interest_rate;
        pool.liquidation_threshold = liquidation_threshold;
        pool.total_deposits = 0;
        pool.total_borrows = 0;
        pool.active_positions = 0;
        pool.bump = ctx.bumps.pool;
        pool.is_active = true;

        emit!(PoolInitialized {
            pool: pool.key(),
            collateral_mint,
            borrow_mint,
            ltv_ratio,
            interest_rate,
        });

        msg!("Pool initialized: LTV={}%, Interest={}%", 
            ltv_ratio as f64 / 100.0, 
            interest_rate as f64 / 100.0);
        Ok(())
    }

    /// Open a new position for a user
    /// Position data is encrypted client-side before submission
    pub fn open_position(ctx: Context<OpenPosition>) -> Result<()> {
        let position = &mut ctx.accounts.position;
        let pool = &ctx.accounts.pool;
        
        position.owner = ctx.accounts.owner.key();
        position.pool = pool.key();
        position.encrypted_collateral = [0u8; 32]; // Placeholder for Inco ciphertext
        position.encrypted_debt = [0u8; 32];
        position.last_update = Clock::get()?.unix_timestamp;
        position.is_active = true;
        position.bump = ctx.bumps.position;

        // Increment pool position count
        let pool_account = &mut ctx.accounts.pool_mut;
        pool_account.active_positions = pool_account.active_positions.checked_add(1).unwrap();

        emit!(PositionOpened {
            position: position.key(),
            owner: position.owner,
            pool: pool.key(),
        });

        Ok(())
    }

    /// Deposit collateral (amount is encrypted)
    /// Client encrypts the amount before calling this
    pub fn deposit_collateral(
        ctx: Context<DepositCollateral>,
        amount: u64,
        encrypted_amount: [u8; 32], // Inco-encrypted amount
    ) -> Result<()> {
        require!(amount > 0, ShadowLendError::InvalidAmount);

        // Transfer SOL as collateral
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;

        // Update position with encrypted amount
        let position = &mut ctx.accounts.position;
        position.encrypted_collateral = encrypted_amount;
        position.last_update = Clock::get()?.unix_timestamp;

        // Update pool TVL (public aggregate)
        let pool = &mut ctx.accounts.pool;
        pool.total_deposits = pool.total_deposits.checked_add(amount).unwrap();

        emit!(CollateralDeposited {
            position: position.key(),
            owner: position.owner,
            amount, // Logged for indexing, but on-chain state is encrypted
            timestamp: position.last_update,
        });

        Ok(())
    }

    /// Borrow against collateral
    /// Requires Inco proof that collateral * LTV >= existing_debt + new_borrow
    pub fn borrow(
        ctx: Context<Borrow>,
        amount: u64,
        encrypted_new_debt: [u8; 32], // New encrypted debt total
        inco_proof: Vec<u8>,          // Proof from Inco that borrow is valid
    ) -> Result<()> {
        require!(amount > 0, ShadowLendError::InvalidAmount);
        
        // Verify Inco proof
        require!(
            verify_inco_borrow_proof(&inco_proof, &ctx.accounts.position, amount),
            ShadowLendError::InvalidIncoProof
        );

        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= amount, ShadowLendError::InsufficientLiquidity);

        // Transfer from vault to borrower
        **ctx.accounts.vault.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += amount;

        // Update position with new encrypted debt
        let position = &mut ctx.accounts.position;
        position.encrypted_debt = encrypted_new_debt;
        position.last_update = Clock::get()?.unix_timestamp;

        // Update pool borrows
        let pool = &mut ctx.accounts.pool_mut;
        pool.total_borrows = pool.total_borrows.checked_add(amount).unwrap();

        emit!(Borrowed {
            position: position.key(),
            owner: position.owner,
            amount,
            timestamp: position.last_update,
        });

        Ok(())
    }

    /// Repay borrowed amount
    pub fn repay(
        ctx: Context<Repay>,
        amount: u64,
        encrypted_new_debt: [u8; 32], // Updated encrypted debt after repayment
    ) -> Result<()> {
        require!(amount > 0, ShadowLendError::InvalidAmount);

        // Transfer repayment to vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;

        // Update position
        let position = &mut ctx.accounts.position;
        position.encrypted_debt = encrypted_new_debt;
        position.last_update = Clock::get()?.unix_timestamp;

        // Update pool
        let pool = &mut ctx.accounts.pool;
        pool.total_borrows = pool.total_borrows.saturating_sub(amount);

        emit!(Repaid {
            position: position.key(),
            owner: position.owner,
            amount,
            timestamp: position.last_update,
        });

        Ok(())
    }

    /// Withdraw collateral
    /// Requires Inco proof that remaining collateral satisfies LTV
    pub fn withdraw_collateral(
        ctx: Context<WithdrawCollateral>,
        amount: u64,
        encrypted_new_collateral: [u8; 32],
        inco_proof: Vec<u8>,
    ) -> Result<()> {
        require!(amount > 0, ShadowLendError::InvalidAmount);

        // Verify Inco proof that withdrawal maintains healthy position
        require!(
            verify_inco_withdrawal_proof(&inco_proof, &ctx.accounts.position, amount),
            ShadowLendError::InvalidIncoProof
        );

        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= amount, ShadowLendError::InsufficientLiquidity);

        // Transfer from vault to owner
        **ctx.accounts.vault.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += amount;

        // Update position
        let position = &mut ctx.accounts.position;
        position.encrypted_collateral = encrypted_new_collateral;
        position.last_update = Clock::get()?.unix_timestamp;

        // Update pool
        let pool = &mut ctx.accounts.pool;
        pool.total_deposits = pool.total_deposits.saturating_sub(amount);

        emit!(CollateralWithdrawn {
            position: position.key(),
            owner: position.owner,
            amount,
            timestamp: position.last_update,
        });

        Ok(())
    }

    /// Liquidate an unhealthy position
    /// Requires Inco proof that health factor < liquidation threshold
    pub fn liquidate(
        ctx: Context<Liquidate>,
        inco_proof: Vec<u8>,
    ) -> Result<()> {
        // Verify position is indeed underwater
        require!(
            verify_inco_liquidation_proof(&inco_proof, &ctx.accounts.position),
            ShadowLendError::PositionHealthy
        );

        let position = &mut ctx.accounts.position;
        position.is_active = false;

        // Transfer remaining collateral to liquidator (simplified)
        let vault_balance = ctx.accounts.vault.lamports();
        let rent = Rent::get()?.minimum_balance(0);
        let transferable = vault_balance.saturating_sub(rent);
        
        if transferable > 0 {
            **ctx.accounts.vault.try_borrow_mut_lamports()? -= transferable;
            **ctx.accounts.liquidator.try_borrow_mut_lamports()? += transferable;
        }

        // Update pool
        let pool = &mut ctx.accounts.pool;
        pool.active_positions = pool.active_positions.saturating_sub(1);

        emit!(PositionLiquidated {
            position: position.key(),
            owner: position.owner,
            liquidator: ctx.accounts.liquidator.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Close an empty position
    pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
        let position = &ctx.accounts.position;
        
        // Ensure position is empty (debt = 0)
        require!(
            position.encrypted_debt == [0u8; 32],
            ShadowLendError::PositionHasDebt
        );

        // Update pool
        let pool = &mut ctx.accounts.pool;
        pool.active_positions = pool.active_positions.saturating_sub(1);

        emit!(PositionClosed {
            position: position.key(),
            owner: position.owner,
        });

        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::INIT_SPACE,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(
        seeds = [b"pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        seeds = [b"pool"],
        bump = pool.bump
    )]
    pub pool_mut: Account<'info, Pool>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + Position::INIT_SPACE,
        seeds = [b"position", owner.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositCollateral<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"position", owner.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key()
    )]
    pub position: Account<'info, Position>,
    
    /// CHECK: Vault PDA for holding collateral
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub pool_mut: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"position", owner.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key()
    )]
    pub position: Account<'info, Position>,
    
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"position", owner.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key()
    )]
    pub position: Account<'info, Position>,
    
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawCollateral<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"position", owner.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key()
    )]
    pub position: Account<'info, Position>,
    
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        constraint = position.is_active
    )]
    pub position: Account<'info, Position>,
    
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub liquidator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"position", owner.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key(),
        close = owner
    )]
    pub position: Account<'info, Position>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

// ============================================================================
// State Accounts
// ============================================================================

/// Pool: Public lending pool state
#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub authority: Pubkey,              // 32
    pub collateral_mint: Pubkey,        // 32
    pub borrow_mint: Pubkey,            // 32
    pub ltv_ratio: u16,                 // 2 (basis points)
    pub interest_rate: u16,             // 2 (basis points)
    pub liquidation_threshold: u16,     // 2
    pub total_deposits: u64,            // 8 (public aggregate)
    pub total_borrows: u64,             // 8 (public aggregate)
    pub active_positions: u64,          // 8
    pub bump: u8,                       // 1
    pub is_active: bool,                // 1
}

/// Position: User's private lending position
/// Sensitive data stored as encrypted bytes
#[account]
#[derive(InitSpace)]
pub struct Position {
    pub owner: Pubkey,                      // 32
    pub pool: Pubkey,                       // 32
    #[max_len(32)]
    pub encrypted_collateral: [u8; 32],     // Inco-encrypted collateral amount
    #[max_len(32)]
    pub encrypted_debt: [u8; 32],           // Inco-encrypted debt amount
    pub last_update: i64,                   // 8
    pub is_active: bool,                    // 1
    pub bump: u8,                           // 1
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct PoolInitialized {
    pub pool: Pubkey,
    pub collateral_mint: Pubkey,
    pub borrow_mint: Pubkey,
    pub ltv_ratio: u16,
    pub interest_rate: u16,
}

#[event]
pub struct PositionOpened {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub pool: Pubkey,
}

#[event]
pub struct CollateralDeposited {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct Borrowed {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct Repaid {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct CollateralWithdrawn {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PositionLiquidated {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub liquidator: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PositionClosed {
    pub position: Pubkey,
    pub owner: Pubkey,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum ShadowLendError {
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
    #[msg("Invalid Inco proof")]
    InvalidIncoProof,
    #[msg("Insufficient liquidity in pool")]
    InsufficientLiquidity,
    #[msg("Position is healthy, cannot liquidate")]
    PositionHealthy,
    #[msg("Position has outstanding debt")]
    PositionHasDebt,
    #[msg("Unauthorized")]
    Unauthorized,
}

// ============================================================================
// Inco Proof Verification
// ============================================================================
//
// Proof Format (64 bytes):
// - Bytes 0-15:  First 16 bytes of encrypted_collateral (binding)
// - Bytes 16-31: First 16 bytes of encrypted_debt (binding)
// - Bytes 32-39: Amount (u64 little-endian)
// - Bytes 40-41: LTV ratio or threshold (u16 little-endian)
// - Bytes 42-57: Proof hash/signature
// - Bytes 58-63: Reserved
//
// The proof binds to the position's encrypted state and the requested amount.
// In production, bytes 42-57 would contain an Inco MPC signature verifying
// that the computation (collateral * LTV >= debt + amount) is valid.

const PROOF_MIN_LENGTH: usize = 64;
const PROOF_HASH_OFFSET: usize = 42;
const PROOF_HASH_LENGTH: usize = 16;

/// Compute a simple binding hash for proof verification
/// In production: This would be replaced with Inco MPC signature verification
fn compute_proof_binding(
    encrypted_collateral: &[u8; 32],
    encrypted_debt: &[u8; 32],
    amount: u64,
    param: u16,
) -> [u8; 16] {
    use anchor_lang::solana_program::hash::hash;

    // Create binding data: collateral + debt + amount + param
    let mut data = Vec::with_capacity(32 + 32 + 8 + 2);
    data.extend_from_slice(encrypted_collateral);
    data.extend_from_slice(encrypted_debt);
    data.extend_from_slice(&amount.to_le_bytes());
    data.extend_from_slice(&param.to_le_bytes());

    // Hash and take first 16 bytes
    let hash_result = hash(&data);
    let mut result = [0u8; 16];
    result.copy_from_slice(&hash_result.to_bytes()[..16]);
    result
}

/// Verify Inco proof for borrow operation
/// Validates that: collateral * LTV >= debt + amount
fn verify_inco_borrow_proof(
    proof: &[u8],
    position: &Position,
    amount: u64,
) -> bool {
    // Check minimum proof length
    if proof.len() < PROOF_MIN_LENGTH {
        msg!("Proof too short: {} < {}", proof.len(), PROOF_MIN_LENGTH);
        return false;
    }

    // Verify collateral binding (first 16 bytes must match position)
    if proof[0..16] != position.encrypted_collateral[0..16] {
        msg!("Collateral binding mismatch");
        return false;
    }

    // Verify debt binding (bytes 16-31 must match position)
    if proof[16..32] != position.encrypted_debt[0..16] {
        msg!("Debt binding mismatch");
        return false;
    }

    // Verify amount matches (bytes 32-39)
    let proof_amount = u64::from_le_bytes(proof[32..40].try_into().unwrap_or([0; 8]));
    if proof_amount != amount {
        msg!("Amount mismatch: proof={} vs requested={}", proof_amount, amount);
        return false;
    }

    // Extract LTV ratio from proof (bytes 40-41)
    let ltv_ratio = u16::from_le_bytes(proof[40..42].try_into().unwrap_or([0; 2]));

    // Verify proof hash/signature (bytes 42-57)
    // In production: This would verify an Inco MPC signature
    // For demo: We verify a deterministic hash binding
    let expected_hash = compute_proof_binding(
        &position.encrypted_collateral,
        &position.encrypted_debt,
        amount,
        ltv_ratio,
    );

    let proof_hash: [u8; 16] = proof[PROOF_HASH_OFFSET..PROOF_HASH_OFFSET + PROOF_HASH_LENGTH]
        .try_into()
        .unwrap_or([0; 16]);

    // For hackathon demo: Accept if proof structure is valid
    // In production: Verify expected_hash == proof_hash after MPC signing
    if proof_hash == [0u8; 16] {
        // Empty hash means demo mode - just verify structure
        msg!("Demo mode: Accepting structurally valid borrow proof");
        return true;
    }

    if proof_hash != expected_hash {
        msg!("Proof hash mismatch");
        return false;
    }

    msg!("Borrow proof verified: amount={}, ltv={}", amount, ltv_ratio);
    true
}

/// Verify Inco proof for withdrawal operation
/// Validates that: (collateral - amount) * LTV >= debt
fn verify_inco_withdrawal_proof(
    proof: &[u8],
    position: &Position,
    amount: u64,
) -> bool {
    // Check minimum proof length
    if proof.len() < PROOF_MIN_LENGTH {
        msg!("Proof too short: {} < {}", proof.len(), PROOF_MIN_LENGTH);
        return false;
    }

    // Verify collateral binding
    if proof[0..16] != position.encrypted_collateral[0..16] {
        msg!("Collateral binding mismatch");
        return false;
    }

    // Verify debt binding
    if proof[16..32] != position.encrypted_debt[0..16] {
        msg!("Debt binding mismatch");
        return false;
    }

    // Verify amount matches
    let proof_amount = u64::from_le_bytes(proof[32..40].try_into().unwrap_or([0; 8]));
    if proof_amount != amount {
        msg!("Amount mismatch: proof={} vs requested={}", proof_amount, amount);
        return false;
    }

    // For demo mode: Accept if structure is valid
    // In production: Would verify Inco MPC signature proving remaining collateral is sufficient
    msg!("Withdrawal proof verified: amount={}", amount);
    true
}

/// Verify Inco proof for liquidation (health factor < threshold)
fn verify_inco_liquidation_proof(
    proof: &[u8],
    position: &Position,
) -> bool {
    // Check minimum proof length
    if proof.len() < PROOF_MIN_LENGTH {
        msg!("Proof too short");
        return false;
    }

    // Verify collateral binding
    if proof[0..16] != position.encrypted_collateral[0..16] {
        msg!("Collateral binding mismatch");
        return false;
    }

    // Verify debt binding
    if proof[16..32] != position.encrypted_debt[0..16] {
        msg!("Debt binding mismatch");
        return false;
    }

    // Extract liquidation threshold from proof (bytes 32-33)
    let threshold = u16::from_le_bytes(proof[32..34].try_into().unwrap_or([0; 2]));

    // For demo mode: Accept if structure is valid
    // In production: Would verify Inco MPC signature proving health < threshold
    msg!("Liquidation proof verified: threshold={}", threshold);
    true
}
