import logging

logging.basicConfig()

r = logging.getLogger()

# set higher
r.setLevel(40)

c = r.getChild('child')

c.addHandler(logging.StreamHandler())

c.setLevel(0);

print('rootlevel', r.level)
print('childlevel', c.level)
print('childeffective', c.getEffectiveLevel())

c.warning('SOME MESSAGE AT LEVEL 30')

r.warning('SOME MESSAGE AT LEVEL 30 AGAIN')
