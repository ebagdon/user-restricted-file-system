# Prerequisites
**NOTE:** This documentation assumes that you are familiar with AWS and other technologies.
1. Make sure that you have the AWS CLI installed and that you are logged in with your credentials.
2. Have the AWS SAM CLI installed.
3. Make sure you have Node.js and NPM installed.
4. You must have a email verified with Amazon SES. Make sure your SES account is in production mode and not sandbox.

# Setup

1. Clone the repository to your local machine.
2. Open a terminal in your new local repository and run the following command to install dependencies:
   ```
   npm install
   ```
3. In **backend-app/template.yaml** there will be several strings that contain the word **"REPLACE"** with other words to serve as instructions. Search for all these strings and replace all of them with the described contents. **For all replacements you make be sure not to remove any quotes.**
4. Open a terminal in the **backend-app/** directory. Then run the following commands to deploy the AWS infrastructure (**WAIT FOR THE FIRST COMMAND TO FINISH BEFORE EXECUTING THE NEXT**):
   ```
   sam build
   ```
   ```
   sam deploy
   ```
5. Next, open up **src/constants/Config.ts**. You will see several strings consisting of text like "PUT HERE." Replace those with the needed values (NOTE: For the API endpoint get the URL from the post method of the s3-object-data resource on the prod stage).
6. Finally, build the React app with the following command:
   ```
   npm run build
   ```
7. Copy all the contents inside the new **dist/** directory and upload them to the bucket that is named in the template.yaml file as "WebsiteBucket."
8. **Congratulations!** The app is now ready.

# How to Use

1. Go to the users area of your newly created Cognito user pool and click on create user. Put in the end user's email and copy the settings in the image below (**THE APP HAS ONLY BEEN TESTED TO WORK WITH THESE SETTINGS**):
<img width="1642" height="577" alt="image" src="https://github.com/user-attachments/assets/d3cdcf49-9dbf-4303-bc2e-97bd3774d43c" />
2. After creating the user click on the user's username in the console and then click edit on the user attributes section. Add the `custom:s3-prefix` attribute. Give it a value as you wish. The user will only be able to download files from S3 that **BEGIN** with the specified prefix.
3. Go to your newly created cloudfront distribution and copy the domain name into your browser to launch the app (NOTE: Using Chrome is highly recommended). The user will be directed through the authentication and download processes.
