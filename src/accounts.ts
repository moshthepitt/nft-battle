import { IDL as PROGRAM_IDL } from '../target/types/battle';
import type { AnchorTypes } from '@saberhq/anchor-contrib';

export type BattleTypes = AnchorTypes<typeof PROGRAM_IDL>;
type Accounts = BattleTypes['Accounts'];

export type BattleAccount = Accounts['battleAccount'];