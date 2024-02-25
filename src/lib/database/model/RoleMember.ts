//CREATE TABLE IF NOT EXISTS rolemembers (userId text, roleId text)

import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Table, Attribute, NotNull } from '@sequelize/core/decorators-legacy';

@Table({
    noPrimaryKey: true,
})
export default class RoleMember extends Model<InferAttributes<RoleMember>, InferCreationAttributes<RoleMember>> {
    @Attribute(DataTypes.STRING)
    @NotNull
    declare userId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare roleId: string;
}