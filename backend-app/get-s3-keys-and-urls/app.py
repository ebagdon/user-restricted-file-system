import boto3
import json

WEBSITE_URL = 'http://localhost:5173'

S3_PREFIX_USER_ATTRIBUTE = 'custom:s3-prefix'
S3_BUCKET_NAME = 'user-restricted-files'

cognito_idp_client = boto3.client('cognito-idp')
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    try:
        get_user_response = cognito_idp_client.get_user(
            AccessToken=json.loads(event['body'])['AccessToken']
        )
        
        valid_s3_prefix = ''
        for attribute in get_user_response['UserAttributes']:
            if attribute['Name'] == S3_PREFIX_USER_ATTRIBUTE:
                valid_s3_prefix = attribute['Value']

        if valid_s3_prefix == '':
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": WEBSITE_URL,
                    "Content-Type": "application/json",
                },
                'body': json.dumps({
                    'error': 'Failed to get a valid S3 prefix for downloading files.',
                }),
             }

        bucket_objects = []
        list_objects_response = s3_client.list_objects_v2(
            Bucket=S3_BUCKET_NAME,
            Prefix=valid_s3_prefix,
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

        s3_keys_and_urls = []
        for object in bucket_objects:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': S3_BUCKET_NAME, 'Key': object['Key']},
                ExpiresIn=7200, # url will expire in 2 hours
            )
            s3_keys_and_urls.append([object['Key'], presigned_url])

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": WEBSITE_URL,
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'S3KeysAndURLs': s3_keys_and_urls
            }),
        }
    except Exception as error:
        print(error)

        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": WEBSITE_URL,
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'message': 'Failed to retrieve data from S3',
            }),
        }
    