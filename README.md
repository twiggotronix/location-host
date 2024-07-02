# location-host

## What it does

location-host is a small tool to automatically update ip adresses in the host file. This tool will show all available networks and allow you to choose wich one you want to set. It can also be run in headless mode to allow automatic network selection when you change wifi network for example.

In the host file, add a `# [location-host]` tag at the end of the line with the Ip adress that you want updating.

### Example host file:

```
192.168.1.2 my-local-ip # [location-host]
192.168.1.3 another-host
192.168.1.2 my-other-host # [location-host]
```

## Setup

### Windows (Work In Progress)

To run the script automatically on every network connection, replace the path to the executable file and run this command in powershell :

```powershell
schtasks /create /tn "RunOnNetworkConnection" /tr "C:\path\to\your\dist\location-host.exe -w -h" /sc onevent /ec Microsoft-Windows-NetworkProfile/Operational /mo "*[System[Provider[@Name='Microsoft-Windows-NetworkProfile'] and EventID=10000]]" /ru "SYSTEM"
```

## Options

| Option    | Short | Type    | Default value                                                               | Description                                                                                                                   |
| --------- | ----- | ------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| wifi      | w     | boolean | false                                                                       | Try and select a connected wifi network                                                                                       |
| ethernet  | e     | boolean | false                                                                       | Try and select a connected wired network                                                                                      |
| hostsFile | f     | string  | `/etc/hosts` for linux, `C:\Windows\System32\drivers\etc\hosts` for windows | Specify the host file to edit, if not specified, the os default is chosen.                                                    |
| headless  | h     | boolean | false                                                                       | Don't ask for any information and fail if a suitable network can't be found , should be run with the wifi or ethernet options |

## Development

To run in development mode, first install the dependencies and run.

> [!WARNING]  
> Needs to be run with administrator priviledges!

```sh
npm install
npm start
```

## Build

Build the app and generate an exe file in the dist folder:

```sh
npm run build
```
