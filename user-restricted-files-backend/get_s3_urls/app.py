import boto3
import json

def lambda_handler(event, context):
    try:
        cognito_identity_client = boto3.client('cognito-identity')
        cognito_idp_client = boto3.client('cognito-idp')
        s3_client = boto3.client('s3')

        get_user_response = cognito_idp_client.get_user(
            AccessToken=json.loads(event['body'])['AccessToken']
        )

        get_id_response = cognito_identity_client.get_id(
            IdentityPoolId='us-east-1:70570661-4f1c-4df7-8ea9-8146752e4662',
            Logins={
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_j9TBZsBzV': json.loads(event['body'])['IdToken'],
            },
        )
        get_credentials_response = cognito_identity_client.get_credentials_for_identity(
            IdentityId=get_id_response['IdentityId'],
            Logins={
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_j9TBZsBzV': json.loads(event['body'])['IdToken'],
            },
        )

        accessKeyId = get_credentials_response['Credentials']['AccessKeyId']
        secretKey = get_credentials_response['Credentials']['SecretKey']
        
        valid_s3_prefix = ''
        for attribute in get_user_response['UserAttributes']:
            if attribute['Name'] == 'custom:s3-prefix':
                valid_s3_prefix = attribute['Value']

        bucket_objects = []
        list_objects_response = s3_client.list_objects_v2(
            Bucket='user-restricted-files',
            Prefix=valid_s3_prefix
        )
        for object in list_objects_response['Contents']:
            bucket_objects.append(object)

        while list_objects_response['IsTruncated']:
            list_objects_response = s3_client.list_objects_v2(
                Bucket='user-restricted-files',
                Prefix=valid_s3_prefix
            )
            for object in list_objects_response['Contents']:
                bucket_objects.append(object)


        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'objects': bucket_objects
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