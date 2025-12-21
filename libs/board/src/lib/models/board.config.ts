import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';

export const BOARD_TYPE_ID = 'sheath.core.board';

export const boardClassConfig: EntityClassConfig = {
  id: BOARD_TYPE_ID,
  name: 'Board',
  properties: ['sheath.core.board.cols', 'sheath.core.board.rows'],
};

export const boardPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.core.board.cols',
    name: 'Columns',
    datatype: 'number',
    default: 3,
  },
  {
    id: 'sheath.core.board.rows',
    name: 'Rows',
    datatype: 'number',
    default: 3,
  },
];
