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

	const listAllRecords = async () => {
		console.log('======= list all items =======')
		const records = []
		let LastEvaluatedKey = null
		while(true) {
			const params = {
				TableName: TableName,
				Limit: 1,
				ExclusiveStartKey: LastEvaluatedKey,
			};
			
			const result = await dynamodb.scan(params).promise();
			// console.log(JSON.stringify(result, null, 2))
			LastEvaluatedKey = result.LastEvaluatedKey
			result.Items.forEach(item => {
				records.push(item)
			})
			if (!LastEvaluatedKey) {
				break
			}
		}
		p(records)
	}

	console.log('====== upsert batch ======')
	const batchPutPayload = {
		RequestItems: {
			[TableName]: [
				{ PutRequest: { Item: { userId: { S: 'user_a' }, groupId: { S: 'group_a' }, groupName: { S: 'AAAA' } } } },
				{ PutRequest: { Item: { userId: { S: 'user_b' }, groupId: { S: 'group_b' }, groupName: { S: 'BBBB' } } } },
				{ PutRequest: { Item: { userId: { S: 'user_c' }, groupId: { S: 'group_c' }, groupName: { S: 'CCCC' } } } },
			]
		}
	}
	await dynamodb.batchWriteItem(batchPutPayload).promise();
	listAllRecords();

	console.log('====== delete items ======')
	const batchDeletePayload = {
		RequestItems: {
			[TableName]: [
				{ DeleteRequest: { Key: { userId: { S: 'user_a' }, groupId: { S: 'group_a' } } } },
				{ DeleteRequest: { Key: { userId: { S: 'user_b' }, groupId: { S: 'group_b' } } } },
			]
		}
	}
	await dynamodb.batchWriteItem(batchDeletePayload).promise()
	listAllRecords();
}

main().catch(console.error)
