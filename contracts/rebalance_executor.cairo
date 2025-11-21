#[starknet::interface]
trait IRebalanceExecutor<TContractState> {
    fn execute_rebalance(ref self: TContractState, position_id: felt252, new_min: u256, new_max: u256, proof_hash: felt252);
    fn schedule_rebalance(ref self: TContractState, position_id: felt252, new_min: u256, new_max: u256, execute_after: u64);
    fn cancel_scheduled_rebalance(ref self: TContractState, rebalance_id: felt252);
    fn get_rebalance_history(self: @TContractState, position_id: felt252) -> Array<RebalanceRecord>;
}

#[derive(Drop, Serde, starknet::Store)]
struct RebalanceRecord {
    position_id: felt252,
    old_min: u256,
    old_max: u256,
    new_min: u256,
    new_max: u256,
    executed_at: u64,
    proof_hash: felt252,
    gas_used: u256,
}

#[starknet::contract]
mod RebalanceExecutor {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use super::RebalanceRecord;

    #[storage]
    struct Storage {
        session_key_manager: ContractAddress,
        position_manager: ContractAddress,
        rebalance_history: Map<felt252, Array<RebalanceRecord>>,
        scheduled_rebalances: Map<felt252, ScheduledRebalance>,
        rebalance_counter: u256,
        min_time_between_rebalances: u64,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct ScheduledRebalance {
        position_id: felt252,
        new_min: u256,
        new_max: u256,
        execute_after: u64,
        is_executed: bool,
        created_by: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        RebalanceExecuted: RebalanceExecuted,
        RebalanceScheduled: RebalanceScheduled,
        RebalanceCancelled: RebalanceCancelled,
    }

    #[derive(Drop, starknet::Event)]
    struct RebalanceExecuted {
        position_id: felt252,
        new_min: u256,
        new_max: u256,
        timestamp: u64,
        proof_hash: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct RebalanceScheduled {
        rebalance_id: felt252,
        position_id: felt252,
        execute_after: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct RebalanceCancelled {
        rebalance_id: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        session_key_manager: ContractAddress,
        position_manager: ContractAddress
    ) {
        self.session_key_manager.write(session_key_manager);
        self.position_manager.write(position_manager);
        self.rebalance_counter.write(0);
        self.min_time_between_rebalances.write(300); // 5 minutes
    }

    #[abi(embed_v0)]
    impl RebalanceExecutorImpl of super::IRebalanceExecutor<ContractState> {
        fn execute_rebalance(
            ref self: ContractState,
            position_id: felt252,
            new_min: u256,
            new_max: u256,
            proof_hash: felt252
        ) {
            assert(new_min < new_max, 'Invalid range');
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            // In production, verify session key authorization here
            // and check position ownership
            
            // Create rebalance record
            let record = RebalanceRecord {
                position_id: position_id,
                old_min: 0, // Would fetch from position
                old_max: 0, // Would fetch from position
                new_min: new_min,
                new_max: new_max,
                executed_at: current_time,
                proof_hash: proof_hash,
                gas_used: 0, // Would calculate actual gas
            };
            
            // Store in history (simplified)
            // In production, append to array properly
            
            self.emit(RebalanceExecuted {
                position_id: position_id,
                new_min: new_min,
                new_max: new_max,
                timestamp: current_time,
                proof_hash: proof_hash,
            });
        }

        fn schedule_rebalance(
            ref self: ContractState,
            position_id: felt252,
            new_min: u256,
            new_max: u256,
            execute_after: u64
        ) {
            assert(new_min < new_max, 'Invalid range');
            assert(execute_after > get_block_timestamp(), 'Invalid execute time');
            
            let caller = get_caller_address();
            let rebalance_id = self.rebalance_counter.read() + 1;
            self.rebalance_counter.write(rebalance_id);
            
            let scheduled = ScheduledRebalance {
                position_id: position_id,
                new_min: new_min,
                new_max: new_max,
                execute_after: execute_after,
                is_executed: false,
                created_by: caller.into(),
            };
            
            self.scheduled_rebalances.write(rebalance_id.try_into().unwrap(), scheduled);
            
            self.emit(RebalanceScheduled {
                rebalance_id: rebalance_id.try_into().unwrap(),
                position_id: position_id,
                execute_after: execute_after,
            });
        }

        fn cancel_scheduled_rebalance(ref self: ContractState, rebalance_id: felt252) {
            let caller = get_caller_address();
            let mut scheduled = self.scheduled_rebalances.read(rebalance_id);
            
            assert(scheduled.created_by == caller.into(), 'Not creator');
            assert(!scheduled.is_executed, 'Already executed');
            
            scheduled.is_executed = true; // Mark as executed to prevent execution
            self.scheduled_rebalances.write(rebalance_id, scheduled);
            
            self.emit(RebalanceCancelled {
                rebalance_id: rebalance_id,
            });
        }

        fn get_rebalance_history(self: @ContractState, position_id: felt252) -> Array<RebalanceRecord> {
            // Return empty for now, in production would return actual history
            array![]
        }
    }
}
