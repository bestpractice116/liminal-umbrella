import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Table, Attribute, NotNull } from '@sequelize/core/decorators-legacy';

@Table({
	noPrimaryKey: true
})
export default class CampaignPlayer extends Model<InferAttributes<CampaignPlayer>, InferCreationAttributes<CampaignPlayer>> {
	@Attribute(DataTypes.STRING)
	@NotNull
	declare userKey: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare campaignKey: string;
}
