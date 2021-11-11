#!/bin/sh

systemctl stop canavarl7
systemctl daemon-reload
sudo apt -y update; sudo apt -y upgrade ; sudo apt install wget; cd ~; curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh; sudo bash nodesource_setup.sh; sudo apt install nodejs -y; sudo apt install git -y; sudo apt install python-pip -y; cd /; mkdir canavarl7; cd canavarl7; wget https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/index.js; npm install express fs axios events moment delay quick.db child_process; cd /lib/systemd/system/; wget https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/canavarl7.service -O canavarl7.service; systemctl daemon-reload; systemctl start canavarl7.service; systemctl enable canavarl7.service; cd/canavarl7/; systemctl status canavarl7.service;
rm /cleanupl7.sh

