user_image_folder = 'static/img/uimg/'
user_detail_image_folder = 'static/img/udimg/'
product_image_folder = 'static/img/pimg/'
product_detail_image_folder = 'static/img/pdimg/'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
check_edit_user = ['id', 'email', 'longtitude', 'latitude',
                   'photo_id', 'sign', 'name', 'introduction', 'sex', 'address']
check_edit_skills = ['user_id', 'skill_ids', 'type', 'action']
status_success = {"code": 10000, "message": "Success"}
status_nouser = {"code": 10001, "message": "No user id"}
status_nolatlog = {"code": 10002, "message": "No latitude or no longtitude"}
status_failed = {"code": 10001, "message": "Failed"}
success_return = {"status": status_success, "data": {}}
failed_return = {"status": status_failed, "data": {}}
dis_radius=0.5
