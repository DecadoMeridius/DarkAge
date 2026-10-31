"""Buildings of the Wilds towns (x_realm.js): the walled city of Kingsbridge, the mining town of
Greyhelm, the woodcutters' village of Ashford and the fishing village of Saltmere. Each is a recipe
in buildings.STY (roof form and material, walls, trims and extras), drawn by buildings.building(),
with a snowy winter version. The city is stone, slate and three storeys; the villages are logs,
thatch and boards."""
from sprites.buildings import STY, building, winterize

TOWN_STY = {
    # Kingsbridge, the city
    'kb_hall': dict(roof='hip', rmat='slate', rcol='#3e4a6a', wmat='ashlar', wcol='#e4dccc', trim='#5a4a3a', cross=1, cupola=1, vane=1, portico=1, arched=1,
                    icon='crest', banners='#6a3a9a', boxes=1, lantern=1, tall=1, rf=.44),
    'kb_temple': dict(roof='front', rmat='slate', rcol='#8a3a2a', wmat='stone', wcol='#d8ccb8', trim='#6a4a3a', portico=1, arched=1, banners='#e8702a', rf=.5),   # the Ember's temple: a front gable in ember red, unlike the hall's slate hip
    'kb_inn': dict(roof='side', rmat='shingle', rcol='#9a3e2a', wmat='plaster', wcol='#f2dcae', trim='#4a2e1a', timber=1, lower='stone', dormers=2,
                   chim=('stone', -40), icon='mug', barrels=1, lantern=1, boxes=1, rf=.42),
    'kb_market': dict(roof='hip', rmat='shingle', rcol='#3e7a52', wmat='plaster', wcol='#f4e6bc', trim='#5a3a22', timber=1, door='shop', shopwin=1,
                      awning='#2a64a0', icon='seed', crates=1, rf=.5),
    'kb_smith': dict(roof='side', rmat='slate', rcol='#4a4e5a', wmat='stone', wcol='#a8a296', trim='#3a2a1a', door='double', chim=('forge', 10), icon='anvil',
                     coal=1, barrels=1, rf=.48),
    'kb_bank': dict(roof='hip', rmat='slate', rcol='#2e3a5a', wmat='ashlar', wcol='#d8d0c0', trim='#6a5a3a', portico=1, arched=1, icon='crest', shut='#2e3a5a', rf=.46),
    'kb_barracks': dict(roof='side', rmat='slate', rcol='#3a3e4a', wmat='stone', wcol='#9a948a', trim='#2a2a30', door='double', banners='#6a3a9a', crates=1, rf=.46),
    'kb_house_a': dict(roof='side', rmat='shingle', rcol='#a8462e', wmat='plaster', wcol='#efdcb4', trim='#5a3a22', timber=1, lower='stone', chim=('brick', -30),
                       shut='#4a6a8a', boxes=1, rf=.46),
    'kb_house_b': dict(roof='side', rmat='slate', rcol='#4e5e74', wmat='brick', wcol='#a85a3e', trim='#e8dcc4', chim=('brick', 20), shut='#2e5a3a', boxes=1, rf=.46),
    'kb_house_c': dict(roof='side', rmat='tile', rcol='#b8643a', wmat='plaster', wcol='#e8d8c0', trim='#3a2a1a', timber=1, dormers=1, chim=('stone', 24), shut='#8a3a2a', rf=.44),
    # Ashford, the woodcutters' village
    'af_tavern': dict(roof='side', rmat='thatch', rcol='#b89a58', wmat='logs', wcol='#8a6a48', trim='#3a2618', chim=('stone', -34), icon='mug', lantern=1, barrels=1, wood=1, rf=.5),
    'af_trader': dict(roof='front', rmat='shingle', rcol='#7a5a3a', wmat='boards', wcol='#9a7a52', trim='#3a2618', icon='seed', crates=1, boxes=1, rf=.56),
    'af_saw': dict(roof='front', rmat='shingle', rcol='#8a6a3a', wmat='logs', wcol='#a8743f', trim='#3a2618', icon='saw', lumber=1, rf=.56),
    'af_hut': dict(roof='side', rmat='thatch', rcol='#a89a5a', wmat='logs', wcol='#7a5a3a', trim='#3a2618', chim=('stone', 12), wood=1, rf=.5),
    # Saltmere, the fishing village
    'sm_tavern': dict(roof='side', rmat='thatch', rcol='#b8a868', wmat='boards', wcol='#a89070', trim='#2a4a6a', icon='mug', nets=1, barrels=1, lantern=1, rf=.46),
    'sm_fish': dict(roof='side', rmat='thatch', rcol='#a89a5a', wmat='boards', wcol='#9a8466', trim='#2a4a6a', icon='fish', nets=1, barrels=1, rf=.46),
    'sm_chandler': dict(roof='side', rmat='shingle', rcol='#2a6a7a', wmat='batten', wcol='#e8e0d0', trim='#2a4a6a', icon='urn', crates=1, rf=.48),
    # Greyhelm, the mining town
    'gh_inn': dict(roof='side', rmat='turf', rcol='#5a8a3a', wmat='stone', wcol='#8a8a86', trim='#4a3020', cross=1, chim=('stone', -40), icon='mug', lantern=1, barrels=1, rf=.46),
    'gh_supply': dict(roof='side', rmat='slate', rcol='#4a4e5a', wmat='stone', wcol='#7a7a78', trim='#3a2a1a', icon='urn', crates=1, coal=1, rf=.48),
}
STY.update(TOWN_STY)
TOWN_SIZES = [('kb_hall', 9, 7), ('kb_temple', 8, 7), ('kb_inn', 7, 6), ('kb_market', 6, 5), ('kb_smith', 6, 5), ('kb_bank', 6, 5), ('kb_barracks', 7, 5),
              ('kb_house_a', 5, 5), ('kb_house_b', 4, 4), ('kb_house_c', 5, 5), ('af_tavern', 7, 5), ('af_trader', 6, 5), ('af_saw', 6, 5), ('af_hut', 4, 4),
              ('sm_tavern', 6, 5), ('sm_fish', 5, 4), ('sm_chandler', 5, 4), ('gh_inn', 7, 5), ('gh_supply', 6, 5)]

SPRITES = {}
for _k, _w, _h in TOWN_SIZES:
    SPRITES[f'bld_{_k}_{_w}x{_h}'] = (lambda k=_k, w=_w, h=_h: building(k, w, h))
    SPRITES[f'bld_{_k}_{_w}x{_h}_w'] = (lambda k=_k, w=_w, h=_h: winterize(building(k, w, h, 1, True)))
