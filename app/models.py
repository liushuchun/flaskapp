#-----*-coding:utf-8-*----
'''
    ~models.py
    This module is some basic model for the database actions
'''
from utils.db import *
from utils.md5 import *
from utils.staticvalues import *
from utils.distance import Distance as dist
from datetime import datetime
import jieba.posseg as pseg
import sys
reload(sys)
sys.setdefaultencoding('utf-8')


def db():
    '''basic database configuration'''
    return Connection(host='127.0.0.1', database='findtutor', user='root', password='Work1354')


class Model(object):

    def __init__(self):
        self.db = db()

    def add_user(self, user):
        '''register the new user'''
        user["password"] = md5(str(user["password"]))
        if self.check_exist(user):
            return False

        columns_string = '(' + ','.join(user.keys()) + ')'
        values_string = '("' + '","'.join(user.values()) + '")'
        query_string = "insert into user%s values%s" % (
            columns_string, values_string)
        print query_string
        result = self.db.execute_lastrowid(query_string)
        if result >= 0:
            return True
        else:
            return False

    def edit_user_profile(self, user):
        '''edit the user's information '''
        if not user.has_key("id"):
            return False
        user_id = user["id"]
        del user["id"]
        if user.has_key("password"):
            user["password"] = md5(str(user["password"]))
        col_val = [key + "='" + value + "'" for key, value in user.iteritems()]
        col_val_string = ",".join(col_val)

        query_string = "update user Set " + \
            string_col_val + " where id=" + user_id
        result = self.db.execute(query_string)
        if result == 0:
            return False
        else:
            return True

    def check_user(self, user_id):
        user = self.db.query('select * from user where id=' + user_id)
        if len(user) != 0:
            return user[0]["password"]
        else:
            return None

    def check_user_name(self, user_name):
        user = self.db.query(
            "select *　from user where name='%s' or email='%s'" % (user_name, user_name))
        if len(user) != 0:
            return True
        else:
            return False

    def update_user_skill(self, user_id, skill_list, types=1, action='add'):
        if types == 1:
            table_name = 'goodat_skills'
        else:
            table_name = 'expect_skills'
        now = datetime.now()
        if not skill_list:
            return False
        print now
        print skill_list
        for skill_id in skill_list:
            query_string = "INSERT INTO %s(skill_id,user_id,reg_time) VALUES(%s,%s,'%s')" % (
                table_name, skill_id, user_id, now)
            print query_string
            result = self.db.query(query_string)
            if result <= 0:
                return False
        return True

    def add_skill_item(name, intro):
        result = self.db.query(
            "INSERT INTO skills(skill_name,skill_intro) values('%s','%s')", (name, intro))
        retrun(True if result > 0 else False)

    def check_exist(self, user):
        if "email" in user.keys():
            check_query_string = "select * from user where name='%s' or email='%s'" % (
                user["name"], user["email"])
        else:
            check_query_string = "select * from user where name='%s'" % (
                user["name"])
        print check_query_string
        if len(self.db.query(check_query_string)) > 0:
            return True
        return False

    def get_user_info(self, user_id):
        if not isinstance(user_id, int):
            return None

        user_id = str(user_id)
        user_string = "select id,photo as photo_id,sign,name,sex,remark as introduction,longitude,latitude,rank_level from user where id=" + \
            user_id
        good_at_string = "select skill_id,skill_name,description  from goodat_skills \
        as A,skills as B,level_rank as C where A.skill_id=B.id and A.level=C.level and user_id=" + user_id
        expect_string = "select skill_id,skill_name,description  from expect_skills as A,skills \
        as B,level_rank as C where A.skill_id=B.id and A.level=C.level and user_id=" + user_id
        user_list = self.db.query(user_string)
        user = user_list[0] if len(user_list) != 0 else None
        good_at_list = self.db.query(good_at_string)
        expect_list = self.db.query(expect_string)
        user["good_at"] = good_at_list
        user["expect"] = expect_list
        return user

    def get_product_list(self, key, user_id, start=0, end=10, radius=10, longitude=None, latitude=None, order_type=1):
        '''This function is very important that there exist three way to sort:
            the Type means :1 order by distance
                            2 order by money
                            3 order by star
                            4 order by sex

        '''

        if key is None or not isinstance(user_id, int):
            return None

        if longitude is not None and latitude is not None:
            user_query = "select sex,longitude,latitude from user where id=" + \
                user_id
            result = self.db.query(user_query)

            if result.__len__() != 0:
                (sex, longitude, latitude) = result[0]
        step = radius * 0.09
        word_list = pseg.cut(key)
        product_list = []
        skill_id = -1
        for key_word in word_list:
            if key_word.flag == 'ns':
                if key_word.word is None:
                    continue
                format_key = self.db.query(
                    "select * from skills where skill_name like %s", ("%" + key_word.word + "%"))
                if len(format_key) == 0:
                    continue
                skill_id = format_key[0]["id"]
                break
        if skill_id < 0:
            return product_list

        if longitude is None or latitude is None:
            product_query =  "select  photo_id,title,A.longtitude,A.latitude,id as product_id,price,sex,star_level from \
            product as A,user as B where A.user_id=B.id skill_id＝%d limit %d,%d" % (skill_id, start, end)
            print product_query
            product_list = self.db.query(product_query)
        else:
            product_query =  "select photo_id,title,A.longitude,A.latitude,\
            id as product_id,price,sex，star_level from product as A,user as B  where A.user_id=B.id and skill_id=%d \
            and longitude between %s and %s and latitude between %s and %s"\
            % (skill_id, longitude - step, longitude + step, latitude - step, latitude + step)
            print product_query

            # throw order type to decide to use which model
            order_string = ""
            if order_type == 2:
                order_string = " order by price"
            if order_type == 3:
                if sex == 1:
                    order_string = " order by sex"
                else:
                    order_string = " order by sex desc"
            if order_type == 4:
                order_string = " order by star_level desc"

            limit_string = " limit %d,%d" % (start, end)
            product_query = product_query + order_string + limit_string
            product_list = self.db.query(product_query)
            for i in xrange(0, len(product_list)):
                product_latitude = product_list[i]["latitude"]
                product_longitude = product_list[i]["longitude"]
                product_list[i]["distance"] = dist.get_distance(
                    longitude, latitude, product_longitude, product_latitude)

            # sort the product by the order type
            if order_type == 1:
                product_list.sort(
                    key=lambda obj: obj.get('distance'), reverse=False)
        return product_list

    def get_product_info(self, product_id):
        '''Get the infomation of the product by parameter id'''
        if not isinstance(product_id, int):
            return None
        product_id = str(product_id)
        product_query = "select title,name as create_name,A.longitude,A.latitude,A.address,start_time,photo_id,price,\
        description from product as A,user as B where A.user_id=B.id and A.id=%s" % (product_id)
        product_list = self.db.query(product_query)

        if len(product_list) == 0:
            return None

        product = product_list[0]
        images = self.db.query(
            "select id from product_images where product_id=" + product_id)
        product["detail_photos"] = images

        comment_query = "select comment,star_level,reg_time from product_evaluates where product_id="\
            + product_id + " order by reg_time"
        comments = self.db.query(comment_query)
        product["comments"] = comments

        return product

    def add_product(self, product):
        '''This function used to add the product to the database'''
        # set the default star_level and the reg_time
        product['reg_time'] = datetime.now()
        columns_string = '(' + ','.join(product.keys()) + ')'
        for key, value in product.items():
            if not isinstance(value, str):
                product[key] = str(value)
        print product
        values_string = "('" + "','".join((product.values())) + "')"
        print values_string
        query_sql = "insert into product" + \
            columns_string + " values" + values_string
        print query_sql
        if self.db.execute(query_sql) >= 0:
            return True
        else:
            return False

    def update_product(self, product):
        '''edit the user's information '''
        if not product.has_key("id"):
            return False

        product_id = product["id"]
        del product["id"]

        col_val = [
            key + "='" + value + "'" for key, value in product.iteritems()]
        col_val_string = ",".join(col_val)

        query_string = "update user Set " + \
            col_val_string + " where id=" + product_id
        result = self.db.execute(query_string)
        if result == 0:
            return False
        else:
            return True

    def verify_user(self, user_name, pass_word):
        sql_query = "select password from user where name=%s or email=%s or qq=%s" % (
            user_name, user_name, user_name)
        passwords = self.db.query(sql_query)
        if len(passwords) == 0:
            return False
        elif passwords[0]["password"] == md5(pass_word):
            return True
        else:
            return False

    def get_recommend(self, user_id):
        sql_query = "select user_id_b as user_id,distance,name,address,sex,photo as photo_id from recommend as A,user as B where user_id_a=%s and A.user_id_b=B.id" % user_id
        user_table = self.db.query(sql_query)
        if len(user_table) == 0:
            return None
        return user_table

    def __str__(self):
        return "the model of the app"

    def __del__(self):
        self.db.close()

if __name__ == "__main__":
    m = Model()
    test_user = {
        "name": "shuchun",
        "email": "24595966@qq.com",
        "password": "aike7641079"
    }
    # m.register(test_user)
    user_id = 1
    print m.get_user_info(user_id)
    # print m.get_product_list(u"弹吉他", 1)
