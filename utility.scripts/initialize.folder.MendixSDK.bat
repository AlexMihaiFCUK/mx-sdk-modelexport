@echo off

echo ---------------------------------------
echo ################## INSTALL DEPENDENCIES
echo ---------------------------------------

call npm install -g typescript
call npm install @types/node
call npm install --save fsutil
rem call npm install @types/fsutil
call npm install --save mendixmodelsdk mendixplatformsdk when @types/when
call npm install --save request
call npm install @types/request
call npm install --save request-promise
call npm install @types/request-promise

echo -----------------------------------------------
echo ################## INITIALIZE PROJECT DIRECTORY 
echo -----------------------------------------------

call npm init --yes
call tsc --init

echo ---------------------------------
echo ################## CHECK VERSIONS
echo ---------------------------------

call node --version
call tsc --version