#----*-coding:utf-8-*----
import math

class Distance(object):
    def rad(d):
        return d * math.pi / 180.0


    def get_distance(point1_lat, point1_lng, point2_lat, point2_lng):
        rad_point1 = rad(point1_lat)
        rad_point2 = rad(point2_lat)
        a = rad_point1 - rad_point2
        b = rad(point1_lng) - rad(point2_lng)
        dist=2*math.asin(math.sqrt(math.pow(math.sin(a/2),2)+math.cos(rad_point2)*math.pow(math.sin(b/2),2)))
        earth_radius=6378.137
        dist=dist*earth_radius
        if dist<0:
        	return -dist
        else:
        	return dist





