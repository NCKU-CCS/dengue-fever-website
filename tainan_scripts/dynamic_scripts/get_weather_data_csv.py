#! /usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from bs4 import BeautifulSoup
import requests
from datetime import datetime
from datetime import timedelta
from datetime import date
from lib import csv_io
from lib import json_io

def get_values(html_doc):
    soup = BeautifulSoup(html_doc)
    body = soup.select('table tr')[3:]
    temp = 0
    rh = 0
    precp = 0
    temp_count = 0
    rh_count = 0
    precp_count = 0
    for row in body:
        tds = row.select('td')
        try:
            temp += float(tds[3].text)
            temp_count += 1
        except:
            pass

        try:
            rh += float(tds[5].text)
            rh_count += 1 
        except:
            pass

        try:
            precp += float(tds[10].text)
            precp_count += 1
        except:
            pass

    if (temp_count != 0):
        temp = round(temp/temp_count, 2)
    else:
        temp = 'NA'
    if (rh_count != 0):
        rh = round(rh/rh_count, 2)
    else:
        rh = 'NA'
    if (precp_count != 0):
        precp = round(precp)
    else:
        precp = 'NA'

    return temp, rh, precp

if __name__=='__main__':
    url_t = "http://e-service.cwb.gov.tw/HistoryDataQuery/DayDataController.do?command=viewMain&station=467410&datepicker="
    now = datetime.strptime('2016/01/01', '%Y/%m/%d').date()
    end = datetime.strptime('2016/02/28', '%Y/%m/%d').date()
    data = ['date', 'temp', 'rh', 'precp']
    while now < end:
        print (now)
        html_doc_t = requests.get(url_t+now.strftime('%Y-%m-%d')).text
        temp_t, rh_t, precp_t = get_values(html_doc_t)

        data.append([now.strftime('%Y/%m/%d'), temp_t, rh_t, precp_t ])
        now += timedelta(days=1)
    csv_io.write_csv('../data/dynamic/kao_weather_2016.csv', data)
