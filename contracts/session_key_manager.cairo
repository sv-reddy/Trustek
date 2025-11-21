#[starknet::interface]
trait ISessionKeyManager<TContractState> {
    fn create_session_key(ref self: TContractState, expiry_days: u64) -> felt252;
    fn authorize_key(ref self: TContractState, session_key: felt252, permissions: u256);
    fn revoke_key(ref self: TContractState, session_key: felt252);
    fn is_valid(self: @TContractState, session_key: felt252) -> bool;
    fn get_permissions(self: @TContractState, session_key: felt252) -> u256;
}

#[starknet::contract]
mod SessionKeyManager {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use core::hash::{HashStateTrait, HashStateExTrait};
    use core::pedersen::PedersenTrait;

    #[storage]
    struct Storage {
        session_keys: Map<felt252, SessionKey>,
        user_keys: Map<felt252, Array<felt252>>,
        owner: ContractAddress,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct SessionKey {
        user: felt252,
        expiry: u64,
        permissions: u256,
        is_active: bool,
        created_at: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        SessionKeyCreated: SessionKeyCreated,
        SessionKeyRevoked: SessionKeyRevoked,
    }

    #[derive(Drop, starknet::Event)]
    struct SessionKeyCreated {
        user: felt252,
        session_key: felt252,
        expiry: u64,
        permissions: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct SessionKeyRevoked {
        session_key: felt252,
        user: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    #[abi(embed_v0)]
    impl SessionKeyManagerImpl of super::ISessionKeyManager<ContractState> {
        fn create_session_key(ref self: ContractState, expiry_days: u64) -> felt252 {
            let caller = get_caller_address();
            let caller_felt: felt252 = caller.into();
            let current_time = get_block_timestamp();
            
            // Generate session key hash
            let session_key = PedersenTrait::new(0)
                .update(caller_felt)
                .update(current_time.into())
                .finalize();
            
            let expiry = current_time + (expiry_days * 86400); // days to seconds
            
            let key_data = SessionKey {
                user: caller_felt,
                expiry: expiry,
                permissions: 0xFFFFFFFF, // Full permissions by default
                is_active: true,
                created_at: current_time,
            };
            
            self.session_keys.write(session_key, key_data);
            
            self.emit(SessionKeyCreated {
                user: caller_felt,
                session_key: session_key,
                expiry: expiry,
                permissions: 0xFFFFFFFF,
            });
            
            session_key
        }

        fn authorize_key(ref self: ContractState, session_key: felt252, permissions: u256) {
            let caller = get_caller_address();
            let mut key_data = self.session_keys.read(session_key);
            
            assert(key_data.user == caller.into(), 'Not key owner');
            
            key_data.permissions = permissions;
            key_data.is_active = true;
            
            self.session_keys.write(session_key, key_data);
        }

        fn revoke_key(ref self: ContractState, session_key: felt252) {
            let caller = get_caller_address();
            let mut key_data = self.session_keys.read(session_key);
            
            assert(key_data.user == caller.into(), 'Not key owner');
            
            key_data.is_active = false;
            self.session_keys.write(session_key, key_data);
            
            self.emit(SessionKeyRevoked {
                session_key: session_key,
                user: caller.into(),
            });
        }

        fn is_valid(self: @ContractState, session_key: felt252) -> bool {
            let key_data = self.session_keys.read(session_key);
            let current_time = get_block_timestamp();
            
            key_data.is_active && key_data.expiry > current_time
        }

        fn get_permissions(self: @ContractState, session_key: felt252) -> u256 {
            let key_data = self.session_keys.read(session_key);
            key_data.permissions
        }
    }
}
