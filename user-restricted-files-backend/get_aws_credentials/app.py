import boto3

def lambda_handler(event, context):
    try:
        client = boto3.client('cognito-identity')
        response = client.get_credentials_for_identity(
            IdentityId=event['IdentityId']
        )

        return {
            'statusCode': 200,
            'accessKeyId': response['Credentials']['AccessKeyId'],
            'secretKey': response['Credentials']['SecretKey']
        }
    except Exception as error:
        return {
            'statusCode': 500,
            'error': error
        }