#---*--coding:utf-8-*----
from models import Model
from datetime import *
model = Model()
now = datetime.now()
import sys
reload(sys)
sys.setdefaultencoding('utf-8')


def add_data():
    product = {
        'title': "家教-小学三年级奥数",
        'address': '上海普陀区629创智天地',
        'reg_time': now.strftime('%Y-%m-%d %H:%M:%S'),
        'start_time': '每周二晚上',
        'price': 20,
        'skill_id': '1',
        'photo_id': '1',
        'star_level': 4.5,
        'description': '小学奥数是非常有利于提高小朋友智商的一种好活动哦的那个',
        'latitude': 121.239,
        'longitude': 31.2324,
        'like_num': 0,
    }
    model.add_product(product)



def add_user():
	user = {
		'name': 'shuchun2',
		'city': '上海',
		'tel': '13524123161',
		'password': 'aike7641079',
		'sex': '1',
		'rank_level': 2
	}
	model.add_user(user)

def get_detail():
	data = {
        'title': '吉他初级课程',
        'create_name': '白羽',
        'create_id': '10',
        'longitude': '120.0',
        'latitude': '110.0',
        'address': '上海华东师范大学',
        'datetime': '每周五下午5点',
        'photo_id': '1',
        'price': '100',
        'detail_photos': ['1', '2', '3'],
        'descrption': '''【教学特色】
            有过近15年的教学经验。经过长期的比较和研究之后，由浅至深的编了民谣教材三本。古典教材俩本。爵士指弹教材一本。少儿吉他教材一本。\
            教学方面注重乐理，基本功的训练，不求速成的填鸭式的教学。以保证学生能够真正明白什么是音乐，
            不跟风现今市场上的速成教学。保证质量不求数量。
            学员毕业后，还可以参加河岸定期举办的吉他沙龙，与吉他爱好者交流表演，分享心得，有展示自我和音乐的机会。
            手鼓班主要教授基础手鼓知识及流行手鼓配乐节奏型。
            声乐班主要教授基础乐理，音准节奏，气息咬字及科学发声练声方法。

            【课堂分类】
            A 民谣吉他
            初级班：1200（12节课，按自己的教程，学会12课为止）
            中级班：1500（12节课）
            提高班：1800（12节课）
            一对一：300/ 节起

            B 古典吉他
            初级班：1200（12节课）
            中级班：1500（12节课）
            一对一：300/ 节起


            C 电吉他
            初级班：1200（12节课）
            中级班：1500（12节课）

            D 爵士指弹
            1500（10节课） '''
    }

if __name__ == "__main__":
    # add_data()
    #add_user()
	#print model.get_product_info(1)
