#[starknet::interface]
trait IPositionManager<TContractState> {
    fn open_position(ref self: TContractState, pool_id: felt252, amount: u256, min_price: u256, max_price: u256);
    fn close_position(ref self: TContractState, position_id: felt252);
    fn get_position(self: @TContractState, position_id: felt252) -> Position;
    fn get_user_positions(self: @TContractState, user: felt252) -> Array<felt252>;
    fn update_position_range(ref self: TContractState, position_id: felt252, new_min: u256, new_max: u256);
}

#[derive(Drop, Serde, starknet::Store)]
struct Position {
    user: felt252,
    pool_id: felt252,
    amount: u256,
    min_price: u256,
    max_price: u256,
    opened_at: u64,
    is_active: bool,
    pnl: u256,
}

#[starknet::contract]
mod PositionManager {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use core::array::ArrayTrait;
    use super::Position;

    #[storage]
    struct Storage {
        positions: Map<felt252, Position>,
        user_positions: Map<felt252, Array<felt252>>,
        position_counter: u256,
        vault_contract: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PositionOpened: PositionOpened,
        PositionClosed: PositionClosed,
        PositionUpdated: PositionUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct PositionOpened {
        user: felt252,
        position_id: felt252,
        pool_id: felt252,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct PositionClosed {
        position_id: felt252,
        user: felt252,
        pnl: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct PositionUpdated {
        position_id: felt252,
        new_min: u256,
        new_max: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, vault_contract: ContractAddress) {
        self.vault_contract.write(vault_contract);
        self.position_counter.write(0);
    }

    #[abi(embed_v0)]
    impl PositionManagerImpl of super::IPositionManager<ContractState> {
        fn open_position(
            ref self: ContractState,
            pool_id: felt252,
            amount: u256,
            min_price: u256,
            max_price: u256
        ) {
            assert(amount > 0, 'Amount must be positive');
            assert(min_price < max_price, 'Invalid price range');
            
            let caller = get_caller_address();
            let caller_felt: felt252 = caller.into();
            
            // Generate position ID
            let position_id = self.position_counter.read() + 1;
            self.position_counter.write(position_id);
            
            let position = Position {
                user: caller_felt,
                pool_id: pool_id,
                amount: amount,
                min_price: min_price,
                max_price: max_price,
                opened_at: get_block_timestamp(),
                is_active: true,
                pnl: 0,
            };
            
            self.positions.write(position_id.try_into().unwrap(), position);
            
            self.emit(PositionOpened {
                user: caller_felt,
                position_id: position_id.try_into().unwrap(),
                pool_id: pool_id,
                amount: amount,
            });
        }

        fn close_position(ref self: ContractState, position_id: felt252) {
            let caller = get_caller_address();
            let mut position = self.positions.read(position_id);
            
            assert(position.user == caller.into(), 'Not position owner');
            assert(position.is_active, 'Position not active');
            
            position.is_active = false;
            self.positions.write(position_id, position);
            
            self.emit(PositionClosed {
                position_id: position_id,
                user: caller.into(),
                pnl: position.pnl,
            });
        }

        fn get_position(self: @ContractState, position_id: felt252) -> Position {
            self.positions.read(position_id)
        }

        fn get_user_positions(self: @ContractState, user: felt252) -> Array<felt252> {
            // In production, maintain an index of user positions
            array![]
        }

        fn update_position_range(
            ref self: ContractState,
            position_id: felt252,
            new_min: u256,
            new_max: u256
        ) {
            let caller = get_caller_address();
            let mut position = self.positions.read(position_id);
            
            assert(position.user == caller.into(), 'Not position owner');
            assert(position.is_active, 'Position not active');
            assert(new_min < new_max, 'Invalid range');
            
            position.min_price = new_min;
            position.max_price = new_max;
            
            self.positions.write(position_id, position);
            
            self.emit(PositionUpdated {
                position_id: position_id,
                new_min: new_min,
                new_max: new_max,
            });
        }
    }
}
