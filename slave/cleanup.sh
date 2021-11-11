#!/bin/sh

systemctl stop canavarl7
rm -r /canavarl7
systemctl daemon-reload
wget https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/setup.sh
chmod +x setup.sh
nohup sh setup.sh &

