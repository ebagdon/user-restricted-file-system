import boto3
import json

def lambda_handler(event, context):
    try:
        cognito_idp_client = boto3.client('cognito-idp')
        s3_client = boto3.client('s3')

        get_user_response = cognito_idp_client.get_user(
            AccessToken=json.loads(event['body'])['AccessToken']
        )
        
        valid_s3_prefix = ''
        for attribute in get_user_response['UserAttributes']:
            if attribute['Name'] == 'custom:s3-prefix':
                valid_s3_prefix = attribute['Value']

        if valid_s3_prefix == '':
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Content-Type": "application/json",
                },
                'body': json.dumps({
                    'error': str(error),
                }),
             }

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

        presigned_urls = []
        for object in bucket_objects:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': 'user-restricted-files', 'Key': object['Key']},
                ExpiresIn=1200,
            )
            presigned_urls.append(presigned_url)

        key = "companyA/text.txt"  # a key you've confirmed exists in the console
        print(s3_client.head_object(Bucket='user-restricted-files', Key=key))

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'S3URLs': presigned_urls
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