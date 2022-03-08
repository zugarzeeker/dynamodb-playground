const DynamoDB = require('aws-sdk/clients/dynamodb')
const config = require('./config')
const { p } = require('./utils')

const TableName = process.env.TABLE_NAME || 'default_table'

const main = async () => {
	const dynamodb = new DynamoDB(config)
	const params = {
		TableName,
		Limit: 1,
	};

	const listRecords = async () => {
		const result = await dynamodb.scan(params).promise();
		console.log('======= list items =======')
		p(result)
	}

	console.log('====== upsert item ======')
	const item = {
		TableName,
		Item: {
			userId: { S: 'user_1' },
			groupId: { S: 'group_1' },
			groupName: { S: 'AAA' }
		}
	}
	p(item)
	await dynamodb.putItem(item).promise();
	listRecords();

	console.log('====== delete item ======')
	await dynamodb.deleteItem(item)
	listRecords();
}

main().catch(console.error)
