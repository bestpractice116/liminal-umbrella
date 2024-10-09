import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';

@Table({ timestamps: false })
export default class Watermark extends Model<InferAttributes<Watermark>, InferCreationAttributes<Watermark>> {
    @Attribute(DataTypes.INTEGER)
    @NotNull
    @PrimaryKey
    declare time: number;
}
