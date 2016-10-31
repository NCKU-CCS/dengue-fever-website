#!/bin/bash
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR
python3 get_tainan_gov.py
python3 get_weather_data.py
python3 dengue_each_day.py
python3 parse_dengue_data.py 2015/10/21
python3 parse_drug_data.py
python3 get_tainan_gov_v2.py
python3 dengue_each_day_v2.py
python3 parse_dengue_data_v2.py 2015/10/21
