const DynamoDB = require('aws-sdk/clients/dynamodb')
const config = require('./config')
const { p } = require('./utils')

const TableName = process.env.TABLE_NAME || 'default_table'

const main = async () => {
	const dynamodb = new DynamoDB(config)
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

	const params = {
		ProjectionExpression: 'userId, groupId', // fields you need
		TableName,
		Limit: 1,
	};
	const result = await dynamodb.scan(params).promise();
	p(result)

	const tables = await dynamodb.listTables().promise()
	p(tables)
}

main().catch(console.error)
