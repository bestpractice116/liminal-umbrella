import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await sq.query('DELETE FROM plannedgames', { raw: true, transaction });
        await sq.query('DELETE FROM gamesessionusersignups', { raw: true, transaction });
        await sq.query('DELETE FROM gamesessions', { raw: true, transaction });
        await sq.query('DELETE FROM gamesystems', { raw: true, transaction });
        await qi.addColumn(
            'gamesystems',
            'tag',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.bulkInsert(
            'gamesystems',
            [
                {
                    name: 'dnd5e',
                    description: 'DnD 5e',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'DnD- 5th Edition'
                },
                {
                    name: 'dnd1e',
                    description: 'DnD 1e',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'DnD- 1e (OSR)'
                },
                {
                    name: 'pathfinder',
                    description: 'Pathfinder 2e',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'DnD- Pathfinder'
                },
                {
                    name: 'vampire',
                    description: 'Vampire the Masquerade',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'WoD- Vampire'
                },
                {
                    name: 'mausritter',
                    description: 'Mausritter',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'ItO- Mausritter'
                },
                {
                    name: 'delta-green',
                    description: 'Delta Green',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'BRP- Delta Green'
                },
                {
                    name: 'cthulu',
                    description: 'Call of Cthulhu',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'BRP- Call of Cthulu'
                },
                {
                    name: 'e bastionland',
                    description: 'E. Bastionland',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'ItO- E. Bastionland'
                },
                {
                    name: 'm bastionland',
                    description: 'M. Bastionland',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'ItO- M. Bastionland'
                },
                {
                    name: 'dnd3e',
                    description: 'DnD 3e',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'DnD- 3rd Edition'
                },
                {
                    name: 'storygames',
                    description: 'Storygames',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'Storygames'
                },
                {
                    name: 'alien',
                    description: 'Alien RPG (Year Zero)',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'YZ- Alien RPG'
                },
                {
                    name: 'dragonbane',
                    description: 'Dragonbane',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'Dragonbane'
                },
                {
                    name: 'coriolis',
                    description: 'Coriolis (Year Zero)',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'YZ- Coriolis'
                },
                {
                    name: 'forvbiden-lands',
                    description: 'Forbidden Lands (Year Zero)',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'YZ- Forbidden Lands'
                },
                {
                    name: 'fallout',
                    description: 'Fallout RPG',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'Fallout'
                },
                {
                    name: 'other-d6',
                    description: 'Other D6',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tag: 'Other D6'
                }
            ],
            { transaction }
        );
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
