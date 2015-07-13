#----*-coding:utf-8-*----
from app.utils.db import *
from app.utils.distance import *
import sys
from app.utils.staticvalues import *
reload(sys)
sys.setdefaultencoding('utf-8')


class RecWorker(object):

    def __init__(self):
        return Connection(host='120.25.237.19', database='findtutor', user='root', password='Work1354')

    def run(self):
        user_query = "select id,longitude,latitude,sex from user"
        user_list = self.db.query(user_query)
        for user in user_list:
            user_id = user["id"]
            user_sex = user["sex"]
            longitude = user["longitude"]
            latitude = user["latitude"]
            if user_sex == 1:
                order = asc
            elif user_sex == 0:
                order = desc

            rec_user_ids_query = "select C.id as id,C.longitude as longitude,C.latitude as latitude from user as C,goodat_skill as D,expect_skills as E \
			where C.latitude between %s and %s and C.longtitude between %s and %s \
			C.id=D.user_id and C.id=E.user_id and D.id in (select skill_id from expect_skills where user_id=%s)  \
			and E.id in (select skill_id from goodat_skills where user_id=%s order by sex %s)" \
            % (latitude - dis_radius, latitude + dis_radius, longtitude - dis_radius, longtitude + dis_radius, user_id, user_id)
            rec_user_list = self.db.query(rec_user_ids_query, order)
            users_around = self.db.query(rec_user_ids_query)
            for i in xrange(0, users_around.__len__()):

                distance = get_distance(
                    users_around[i]["latitude"], users_around["longtitude"], latitude, longtitude)
                users_around[i]["dist"] = distance

                insert_query="insert into recommend(user_id_a,user_id_b,distance) values(%s,%s,%s)" % (user_id,users_around[i]["id"])

                self.db.query(insert_query)






