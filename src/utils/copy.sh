#!/bin/sh 
cd /Users/liujunhang/Desktop/learnVue/learnNode/blog1/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log