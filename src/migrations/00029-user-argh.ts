import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    //const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        //await sq.query("DELETE FROM users WHERE username IN ('badbonepanda', 'yjen', '_chiae', 'generaldruzod', 'greatluxurysalt')", { raw: true, transaction });
        await sq.query(
            "DELETE FROM users WHERE username IN ('imtired', 'sorcha.flame.on', 'astroboy101.', 'sirprises', 'alycat604', 'doomsdaydevice', 'meownerva')",
            { raw: true, transaction }
        );
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
