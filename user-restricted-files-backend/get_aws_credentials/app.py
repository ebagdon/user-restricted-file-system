import boto3
import json

def lambda_handler(event, context):
    try:
        client = boto3.client('cognito-identity')

        get_id_response = client.get_id(
            IdentityPoolId='us-east-1:70570661-4f1c-4df7-8ea9-8146752e4662',
            Logins={
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_j9TBZsBzV': json.loads(event['body'])['IdToken'],
            },
        )
        get_credentials_response = client.get_credentials_for_identity(
            IdentityId=get_id_response['IdentityId'],
            Logins={
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_j9TBZsBzV': json.loads(event['body'])['IdToken'],
            },
        )

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'accessKeyId': get_credentials_response['Credentials']['AccessKeyId'],
                'secretKey': get_credentials_response['Credentials']['SecretKey'],
            }),
        }
    except Exception as error:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'error': str(error),
            }),
        }