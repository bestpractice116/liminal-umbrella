import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table, Unique  } from '@sequelize/core/decorators-legacy';
import { z } from "zod";

export enum ActivityType {
  Playing = 'playing',
  Steaming = 'streaming',
  Listening = 'listening',
  Watching = 'watching',
}

export const createSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }).trim().min(3, { message: "Name must be at least 3 characters long"
    }).max(4, { message: "Name must be less than 5 characters"
    }),
    type: z.nativeEnum(ActivityType),
});

export const deleteSchema = z.object({
  key: z.coerce.number().int().positive(),
});

export const updateSchema = createSchema.merge(deleteSchema);

@Table({ tableName: 'activities' })
export default class Activity extends Model<InferAttributes<Activity>, InferCreationAttributes<Activity>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare key: number | null;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Unique
    declare name: string;

    @Attribute(DataTypes.ENUM('playing', 'streaming', 'listening', 'watching'))
    @NotNull
    declare type: ActivityType;
}