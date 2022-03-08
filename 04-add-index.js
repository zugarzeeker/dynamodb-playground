const DynamoDB = require('aws-sdk/clients/dynamodb')
const config = require('./config')
const { p } = require('./utils')

const TableName = process.env.TABLE_NAME || 'default_table'
const userId = 'user_1'
const groupId = 'group_1'

const main = async () => {
	const dynamodb = new DynamoDB(config)

	console.log('====== create table ======')
	await dynamodb.createTable({
		TableName,
		KeySchema: [
			{ AttributeName: 'userId', KeyType: 'HASH' },
			{ AttributeName: 'groupId', KeyType: 'RANGE' },
		],
		AttributeDefinitions: [
			{ AttributeName: 'userId', AttributeType: 'S' },
			{ AttributeName: 'groupId', AttributeType: 'S' },
		],
		GlobalSecondaryIndexes: [
			{
				IndexName: 'by_userId',
				KeySchema: [
					{ AttributeName: 'userId', KeyType: 'HASH' },
				],
				Projection: {
					ProjectionType: 'ALL',
				},
			},
		],
		BillingMode: 'PAY_PER_REQUEST'
	}).promise()

	console.log('====== update table ======')
	await dynamodb.updateTable({
		TableName,
		AttributeDefinitions: [
			{ AttributeName: 'userId', AttributeType: 'S' },
			{ AttributeName: 'groupId', AttributeType: 'S' },
			{ AttributeName: 'userId-groupId', AttributeType: 'S' },
		],
		GlobalSecondaryIndexUpdates: [
			{
				Create: {
					IndexName: 'by_user_group',
					KeySchema: [
						{ AttributeName: 'userId-groupId', KeyType: 'HASH' },
					],
					Projection: {
						ProjectionType: 'ALL',
					},
				},
			}
		],
	}).promise()
	console.log('====== upsert item ======')

	const item = {
		TableName,
		Item: {
			userId: { S: userId },
			groupId: { S: groupId },
			'userId-groupId': { S: `${userId}-${groupId}` },
			groupName: { S: 'AAA' }
		}
	}
	p(item)
	await dynamodb.putItem(item).promise();
	
	console.log('====== get item ======')
	const queryResult = await dynamodb.query({
		TableName,
		IndexName: 'by_user_group',
		KeyConditionExpression: '#ugId = :value',
		ExpressionAttributeNames: {
			'#ugId': 'userId-groupId',
		},
		ExpressionAttributeValues: {
			':value': { S: `${userId}-${groupId}` },
		},
		Limit: 1
	}).promise();
	p(queryResult.Items[0])
}

main().catch(console.error)
