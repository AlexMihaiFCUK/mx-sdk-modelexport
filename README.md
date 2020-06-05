# Model Export
## Installation
Set up your development tools by following the steps in this article:

[https://docs.mendix.com/apidocs-mxsdk/mxsdk/setting-up-your-development-environment](https://docs.mendix.com/apidocs-mxsdk/mxsdk/setting-up-your-development-environment)

Clone the repository to a folder on your local pc and then open the folder in a command prompt. 

Install project dependencies by running the following command

`npm install`

## Configuration

In the src folder, create a file config.json (see config.json.example for a sample).

### auth

```
{
    "auth" : {
        "username":"",
        "apikey":""
    }
    ...
}
```

**auth.username**: Your Mendix login (i.e. your email address)

**auth.apikey**: An api key that you have generated for your Mendix login (not a project api key)

To generate it, log into https://sprintr.home.mendix.com/, click on your avatar at the top right of the page and the click on "My Profile".
On the profile page click the cog on the right.
On the new page, click the "API Keys@ tab and then "Create new API key"
https://docs.mendix.com/developerportal/mendix-profile/#api-key

### app
```
{
    ...
    "app":{
        "id":"",
        "name":"",
        "branch": ""
    }
    ...
}
```

**app.id**: The id of your app

To find it, from https://sprintr.home.mendix.com click on "Apps" at the top, then "My Apps".
From the "My Apps" list click on the app you're looking for.
On the App page click on "General" under "Settings" on the left.
There you will find the App ID 

**app.name**: The name of your app

**app.branch**: The name of the branch you want to use (or empty string for the main line)  

## Run the script
Compile and run the script by running the following command:

`npm start`

The script will do the following:

- create a folder called 'out' if it doesn't already exist
- create a folder named after the project. If one already exists the script will exit. 
- iterate over every ModuleSecurity and ModuleDocument object and store them in module specific sub folders under the project.