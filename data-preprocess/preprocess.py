import os
import csv
import re
import json
import googlemaps
import traceback
import time
from pprint import pprint
import urllib.request, urllib.parse
from collections import namedtuple, defaultdict
from recordclass import recordclass
from datetime import date
from loading_bar import *


from argparse import ArgumentParser
parser = ArgumentParser()
parser.add_argument('data_folder')
parser.add_argument('airline_codes')
parser.add_argument('airport_codes')
parser.add_argument('gmaps_key_file')
parser.add_argument('output_file')
args = parser.parse_args()

data_folder = os.path.abspath(args.data_folder)
airline_codes = os.path.abspath(args.airline_codes)
airport_codes = os.path.abspath(args.airport_codes)
gmaps_key_file = os.path.abspath(args.gmaps_key_file)
output_file = os.path.abspath(args.output_file)


def load_airline_names():
    with open(airline_codes, 'r') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            code, airline_name = row
            yield code, airline_name
airline_names = dict(load_airline_names())

with open(gmaps_key_file, 'r') as f:
    gmaps_api_key = f.read()
    print('Google Maps API key: "{}"'.format(gmaps_api_key))

Location = namedtuple('Location', ['name', 'lat', 'lon'])

def load_airport_addresses():
    with open(airport_codes, 'r') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            code, airport_loc_str = row
            yield code, airport_loc_str

airport_addresses = dict(load_airport_addresses())

last_rate_reset_time = 0
requests_in_last_second = 0
airport_locations = dict()
# pprint(json.loads(urllib.request.urlopen('https://maps.googleapis.com/maps/api/geocode/json?address=Portland%252C%2BOR%253A%2BPortland%2BInternational&key=AIzaSyAakOugaRniDkXkic5dBRa9GOpUbio57sk').read().decode('utf-8')))
def get_airport_location(loc_str):
    # return loc_str
    if loc_str in airport_locations: return airport_locations[loc_str]
    # if loc_str == 'Portland, OR: Portland International': return Location(0, 0)
    geocode_result = None
    try:
        global requests_in_last_second, last_rate_reset_time
        t = time.time()
        if t > last_rate_reset_time + 1:
            # print('reset rate')
            requests_in_last_second = 0
            last_rate_reset_time = t
        if requests_in_last_second >= 10:
            delay = 1.1 - (t - last_rate_reset_time)
            # print('sleeping {:f}'.format(delay))
            time.sleep(delay)
            # print('reset rate')
            requests_in_last_second = 0
            last_rate_reset_time = time.time()
        requests_in_last_second += 1
        # print('requests in last second: {:d}'.format(requests_in_last_second))
        # print(loc_str)
        # m = re.match(r'.+, (\w{2}): (.+)', loc_str)
        # edited_loc_str = '{}, {}'.format(m.group(2), m.group(1))
        # print(edited_loc_str)
        geocode_result = json.loads(urllib.request.urlopen('https://maps.googleapis.com/maps/api/geocode/json?address={}&key={}'.format(urllib.parse.quote(loc_str), urllib.parse.quote(gmaps_api_key))).read().decode('utf-8'))
        # geocode_result = gmaps.geocode(loc_str)
        location = geocode_result['results'][0]['geometry']['location']
        location = Location(name=loc_str, lat=location['lat'], lon=location['lng'])
    except KeyboardInterrupt as e:
        sys.exit()
    except:
        print('Location: {}'.format(loc_str))
        print('API call result:')
        pprint(geocode_result)
        print(traceback.format_exc())
        location = 'REPLACE ' + loc_str
    airport_locations[loc_str] = location
    return location

def in_us(wac):
    return wac <= 93 and wac not in [3, 4, 5]

DataKey = namedtuple('DataKey', ['airport', 'airline', 'month'])
DataValue = recordclass('DataValue', ['avg_arr_delay', 'flight_count'])
data_pts = defaultdict(lambda: DataValue(0, 0))

print('Parsing flight data...')

loading_bar_init(len(os.listdir(data_folder)))
for data_file_path in os.listdir(data_folder):
    with open(os.path.join(data_folder, data_file_path), 'r') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            row = row[:-1]
            if any(not v for v in row): continue
            FL_DATE, UNIQUE_CARRIER, ORIGIN_AIRPORT_ID, ORIGIN_WAC, DEST_AIRPORT_ID, DEST_WAC, DEP_DELAY, ARR_DELAY = row

            origin_loc = int(ORIGIN_WAC)

            dest_loc = int(DEST_WAC)

            if not in_us(origin_loc) or not in_us(dest_loc): continue

            m = re.match(r'(\d+)[/\-](\d+)[/\-](\d+)', FL_DATE)
            flight_date = date(int(m.group(1)), int(m.group(2)), int(m.group(3)))

            airline = str(UNIQUE_CARRIER)

            origin_airport = str(ORIGIN_AIRPORT_ID)

            dest_airport = str(DEST_AIRPORT_ID)

            dep_delay = float(DEP_DELAY)

            arr_delay = float(ARR_DELAY)

            key = DataKey(get_airport_location(airport_addresses[dest_airport]), airline_names[airline], flight_date.month)
            value = data_pts[key]
            value.flight_count += 1
            value.avg_arr_delay += arr_delay
    loading_bar_update()
loading_bar_finish()

print('Creating JSON data...')

json_data = list()

loading_bar_init(len(data_pts))
for key, value in data_pts.items():
    value.avg_arr_delay /= value.flight_count
    json_object = {**key._asdict(), **value._asdict()}
    if isinstance(json_object['airport'], Location):
        json_object['airport'] = {'name': json_object['airport'].name, 'lat': json_object['airport'].lat, 'lon': json_object['airport'].lon}
    json_data.append(json_object)
    loading_bar_update()
loading_bar_finish()

print('Writing JSON data...')

with open(args.output_file, 'w') as f:
    json.dump(json_data, f)
