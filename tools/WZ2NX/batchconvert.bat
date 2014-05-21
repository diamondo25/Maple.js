@echo off
for /r %CWD% %%f in (*.wz) do WZ2NX.exe --in="%%f" --wzv=GMS
echo done
pause