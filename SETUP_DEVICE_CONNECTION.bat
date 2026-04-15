@echo off
echo Setting up Direct Connection for Biometric Device...
echo.
echo 1. Creating a private network on your Ethernet port...
netsh interface ip set address "Ethernet" static 192.168.5.1 255.255.255.0
echo.
echo -------------------------------------------------------
echo SUCCESS! Your Computer's Wired IP is now: 192.168.5.1
echo -------------------------------------------------------
echo.
echo NOW GO TO YOUR SECUREYE DEVICE AND SET THESE:
echo.
echo [Network Settings]
echo IP Address: 192.168.5.2
echo Subnet Mask: 255.255.255.0
echo Gateway: 192.168.5.1
echo.
echo [Server / Cloud Settings]
echo Server IP: 192.168.5.1
echo Server Port: 5000
echo.
echo -------------------------------------------------------
pause
