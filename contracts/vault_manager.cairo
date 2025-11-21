#[starknet::interface]
trait IVaultManager<TContractState> {
    fn deposit(ref self: TContractState, amount: u256);
    fn withdraw(ref self: TContractState, amount: u256);
    fn rebalance(ref self: TContractState, lower_bound: u256, upper_bound: u256, proof_hash: felt252);
    fn get_balance(self: @TContractState, user: felt252) -> u256;
    fn authorize_session_key(ref self: TContractState, session_key: felt252, expiry: u64);
    fn revoke_session_key(ref self: TContractState, session_key: felt252);
}

#[starknet::contract]
mod VaultManager {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;

    #[storage]
    struct Storage {
        balances: LegacyMap<felt252, u256>,
        session_keys: LegacyMap<felt252, u64>,  // session_key => expiry
        owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    #[abi(embed_v0)]
    impl VaultManagerImpl of super::IVaultManager<ContractState> {
        fn deposit(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let current_balance = self.balances.read(caller.into());
            self.balances.write(caller.into(), current_balance + amount);
        }

        fn withdraw(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let current_balance = self.balances.read(caller.into());
            assert(current_balance >= amount, 'Insufficient balance');
            self.balances.write(caller.into(), current_balance - amount);
        }

        fn rebalance(
            ref self: ContractState,
            lower_bound: u256,
            upper_bound: u256,
            proof_hash: felt252
        ) {
            let caller = get_caller_address();
            
            // Check if caller is owner or has valid session key
            let is_owner = caller == self.owner.read();
            let session_expiry = self.session_keys.read(caller.into());
            let has_valid_session = session_expiry > get_block_timestamp();
            
            assert(is_owner || has_valid_session, 'Unauthorized');
            
            // Rebalancing logic would go here
            // For now, just validate the range
            assert(lower_bound < upper_bound, 'Invalid range');
        }

        fn get_balance(self: @ContractState, user: felt252) -> u256 {
            self.balances.read(user)
        }

        fn authorize_session_key(ref self: ContractState, session_key: felt252, expiry: u64) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can authorize');
            self.session_keys.write(session_key, expiry);
        }

        fn revoke_session_key(ref self: ContractState, session_key: felt252) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can revoke');
            self.session_keys.write(session_key, 0);
        }
    }
}
