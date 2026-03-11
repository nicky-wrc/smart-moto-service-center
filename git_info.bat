@echo off
echo === GIT STATUS === > d:\git_output.txt
git status >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo === FETCH ALL === >> d:\git_output.txt
git fetch --all >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo === ALL BRANCHES === >> d:\git_output.txt
git branch -a >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo === LOG Nicky_dev (last 5) === >> d:\git_output.txt
git log --oneline -10 Nicky_dev >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo === LOG Pooh_Black (last 5) === >> d:\git_output.txt
git log --oneline -10 origin/Pooh_Black >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo === DIFF STAT Nicky_dev vs Pooh_Black === >> d:\git_output.txt
git diff --stat Nicky_dev origin/Pooh_Black >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo === DIFF NAME-STATUS === >> d:\git_output.txt
git diff --name-status Nicky_dev origin/Pooh_Black >> d:\git_output.txt 2>&1
echo. >> d:\git_output.txt

echo DONE >> d:\git_output.txt
