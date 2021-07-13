# How to run

1. Make the `.env` file at top dir.
2. Put your discord bot token into the file with this format `TOKEN={your_token}`.
3. run
```
npm run bot
```

# How to deploy (heroku)

heroku(https://www.heroku.com) is a cloud application platform.  
For installation, follow the link(https://devcenter.heroku.com/articles/heroku-cli)

## make new app

1. Login
```shell
heroku login
```
2. Make your application in heroku.
```shell
heroku apps:create {application_name} -b heroku/nodejs
```

## setup
Set TOKEN as env value.
```shell
heroku config:set -a {application_name} TOKEN {your_token}
```

## setting deploy
1. Move to the heroku website.
2. Open `deploy` tab to set up your deployment.
3. After first deployment, open `resources` tab to activate worker ryno and inactivate web ryno 

# Invitaion url

https://discord.com/oauth2/authorize?client_id=861782816373866538&scope=bot+applications.commands
