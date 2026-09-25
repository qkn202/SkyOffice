"""
Hogwarts Great Hall (Đại Sảnh Đường) Map Generator & Deployment for SkyOffice.
Constructs a focused, compact, beautifully proportioned Great Hall map (26x22 tiles = 832x704 px),
replacing the dispersed modern 40x30 office floorplan with an authentic Hogwarts castle centerpiece.
"""

import json
import os
import shutil

BASE_DIR = '/Users/khang/skyoffice-base'
CLIENT_DIR = os.path.join(BASE_DIR, 'client')
PUBLIC_MAP_DIR = os.path.join(CLIENT_DIR, 'public/assets/map')
DIST_MAP_DIR = os.path.join(CLIENT_DIR, 'dist/assets/map')
BACKUP_MAP = os.path.join(PUBLIC_MAP_DIR, 'map.original_40x30.json')
TARGET_MAP = os.path.join(PUBLIC_MAP_DIR, 'map.json')
GREAT_HALL_MAP = os.path.join(PUBLIC_MAP_DIR, 'map_great_hall.json')
GAME_TS_PATH = os.path.join(CLIENT_DIR, 'src/scenes/Game.ts')

W, H = 26, 22
TILE_SIZE = 32

def build_great_hall_map():
    print(f"Generating Compact Hogwarts Great Hall Map ({W}x{H} tiles, {W*TILE_SIZE}x{H*TILE_SIZE} px)...")

    # Read tilesets from existing map to ensure 100% GID alignment
    source_map = BACKUP_MAP if os.path.exists(BACKUP_MAP) else TARGET_MAP
    with open(source_map, 'r') as f:
        orig = json.load(f)

    tilesets = orig['tilesets']

    # GID shortcuts
    # FloorAndGround (firstgid: 1)
    G_PILLAR = 149
    G_WALL = 930
    G_TORCH = 722
    G_BANNER_GRYFF = 721
    G_BANNER_SLYTH = 723
    G_FLAGSTONE = 412
    G_CORRIDOR = 415
    G_DAIS_OAK = 1607
    G_DAIS_STEP = 348
    G_CARPET_GRYFF = 2383
    G_CARPET_HUFF = 217
    G_CARPET_RAVEN = 415
    G_CARPET_SLYTH = 668

    # Ensure walkable tiles have collides = False and walls have collides = True
    for ts in tilesets:
        if ts.get('name') == 'FloorAndGround':
            for t in ts.get('tiles', []):
                tid = t.get('id', -1)
                gid = tid + 1
                if gid in [217, 412, 415, 1607, 348, 2383, 668]:
                    for p in t.get('properties', []):
                        if p.get('name') == 'collides':
                            p['value'] = False
                elif gid in [930, 722, 721, 723]:
                    for p in t.get('properties', []):
                        if p.get('name') == 'collides':
                            p['value'] = True

    # Modern_Office_Black_Shadow (firstgid: 2584)
    M_TABLE_TOP = 3019
    M_TABLE_CANDELABRA = 3020
    M_TABLE_END = 3003
    M_BOOKCASE_TOP = 2596
    M_BOOKCASE_BOT = 2612

    # Items
    C_CHAIR_DOWN = 2562 # frame 1
    C_CHAIR_LEFT = 2563 # frame 2
    C_CHAIR_RIGHT = 2564 # frame 3
    C_CHAIR_UP = 2566 # frame 5

    COMP_ALCHEMY = 4680 # 96x64 (3x2 tiles)
    WB_NOTICE = 4685   # 64x64 (2x2 tiles)
    VM_FLOO = 5488     # 48x72

    # 1. GROUND LAYER
    ground_data = [0] * (W * H)
    for y in range(H):
        for x in range(W):
            idx = y * W + x
            # Perimeter Walls
            if y in [0, 1] or y in [18, 19] or x in [0, W - 1]:
                if y in [18, 19] and 11 <= x <= 14:
                    # Grand entrance threshold
                    ground_data[idx] = G_CORRIDOR
                elif (x, y) in [(3, 1), (8, 1), (17, 1), (22, 1), (0, 7), (0, 13), (W - 1, 7), (W - 1, 13)]:
                    ground_data[idx] = G_TORCH
                elif (x, y) == (11, 1):
                    ground_data[idx] = G_BANNER_GRYFF
                elif (x, y) == (14, 1):
                    ground_data[idx] = G_BANNER_SLYTH
                else:
                    ground_data[idx] = G_WALL
            elif y in [2, 3]:
                # Dais elevated platform
                ground_data[idx] = G_DAIS_OAK
            elif y == 4:
                # Dais stone step
                ground_data[idx] = G_DAIS_STEP
            elif y in [20, 21]:
                # South entrance foyer
                ground_data[idx] = G_CORRIDOR
            else:
                # Main Hall Floor
                if 11 <= x <= 14:
                    ground_data[idx] = G_CORRIDOR # Grand Processional Aisle
                elif x in [4, 5]:
                    ground_data[idx] = G_CARPET_GRYFF # Gryffindor
                elif x in [8, 9]:
                    ground_data[idx] = G_CARPET_HUFF # Hufflepuff
                elif x in [16, 17]:
                    ground_data[idx] = G_CARPET_RAVEN # Ravenclaw
                elif x in [20, 21]:
                    ground_data[idx] = G_CARPET_SLYTH # Slytherin
                else:
                    ground_data[idx] = G_FLAGSTONE

    next_obj_id = 1
    def make_obj(x, y, gid, w=32, h=32, name="", props=None):
        nonlocal next_obj_id
        obj = {
            "height": h,
            "id": next_obj_id,
            "name": name,
            "rotation": 0,
            "type": "",
            "visible": True,
            "width": w,
            "x": x,
            "y": y
        }
        if gid is not None:
            obj["gid"] = gid
        if props:
            obj["properties"] = props
        next_obj_id += 1
        return obj

    # 2. WALL OBJECTS (Gothic Stone Pillars)
    wall_objs = []
    for py in [6, 11, 16]:
        for px in [1, 7, 18, 24]:
            wall_objs.append(make_obj(px * 32, (py + 1) * 32, G_PILLAR, 32, 32))

    # 3. CHAIR OBJECTS
    chair_objs = []
    # High Table Chairs (on the Dais facing down)
    for cx in [9, 11, 12, 13, 14, 16]:
        chair_objs.append(make_obj(
            cx * 32, (3) * 32, C_CHAIR_DOWN, 32, 64,
            props=[{"name": "direction", "type": "string", "value": "down"}]
        ))

    # 4 House Banquet Tables Chairs (rows 6..14, even rows)
    house_tables_x = [5, 9, 16, 20]
    for tx in house_tables_x:
        for ty in range(6, 15, 2):
            chair_objs.append(make_obj(
                (tx - 1) * 32, (ty + 1) * 32, C_CHAIR_RIGHT, 32, 64,
                props=[{"name": "direction", "type": "string", "value": "right"}]
            ))
            chair_objs.append(make_obj(
                (tx + 1) * 32, (ty + 1) * 32, C_CHAIR_LEFT, 32, 64,
                props=[{"name": "direction", "type": "string", "value": "left"}]
            ))

    # 4. COMPUTER OBJECTS (Hogwarts Alchemy & Study Desks)
    comp_objs = []
    comp_objs.append(make_obj(4 * 32, 11 * 32, COMP_ALCHEMY, 96, 64))
    comp_objs.append(make_obj(15 * 32, 11 * 32, COMP_ALCHEMY, 96, 64))
    comp_objs.append(make_obj(11 * 32 + 16, 4 * 32, COMP_ALCHEMY, 96, 64))

    # 5. WHITEBOARD OBJECTS (Grand Hogwarts Notice Board)
    wb_objs = []
    wb_objs.append(make_obj(3 * 32, 18 * 32, WB_NOTICE, 64, 64))
    wb_objs.append(make_obj(21 * 32, 18 * 32, WB_NOTICE, 64, 64))

    # 6. VENDING MACHINE (Floo Network Fireplace)
    vm_objs = []
    vm_objs.append(make_obj(2 * 32 + 8, 3 * 32 + 8, VM_FLOO, 48, 72))

    # 7. OBJECTS & OBJECTS ON COLLIDE (Banquet Tables & Bookcases)
    objs_non_collide = []
    objs_collide = []

    # High Table at Dais (x=8..17, y=3)
    for tx in range(8, 18):
        gid = M_TABLE_CANDELABRA if tx in [10, 15] else M_TABLE_TOP
        objs_collide.append(make_obj(tx * 32, 4 * 32, gid, 32, 32))

    # 4 House Long Banquet Tables (y=6..14)
    for tx in house_tables_x:
        for ty in range(6, 15):
            if ty in [10, 11] and tx in [5, 16]:
                continue
            gid = M_TABLE_CANDELABRA if ty % 3 == 0 else M_TABLE_TOP
            objs_collide.append(make_obj(tx * 32, (ty + 1) * 32, gid, 32, 32))

    # Grimoire Bookcases at North-East Dais (x=23, y=2..3)
    objs_collide.append(make_obj(23 * 32, 3 * 32, M_BOOKCASE_TOP, 32, 32))
    objs_collide.append(make_obj(23 * 32, 4 * 32, M_BOOKCASE_BOT, 32, 32))

    # Assemble layers
    layers = [
        {
            "data": ground_data,
            "height": H,
            "id": 1,
            "name": "Ground",
            "opacity": 1,
            "type": "tilelayer",
            "visible": True,
            "width": W,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 2,
            "name": "Wall",
            "objects": wall_objs,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 3,
            "name": "Chair",
            "objects": chair_objs,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 4,
            "name": "Objects",
            "objects": objs_non_collide,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 5,
            "name": "ObjectsOnCollide",
            "objects": objs_collide,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 6,
            "name": "GenericObjects",
            "objects": [],
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 7,
            "name": "GenericObjectsOnCollide",
            "objects": [],
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 8,
            "name": "Computer",
            "objects": comp_objs,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 9,
            "name": "Whiteboard",
            "objects": wb_objs,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 10,
            "name": "Basement",
            "objects": [],
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 11,
            "name": "VendingMachine",
            "objects": vm_objs,
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        }
    ]

    map_dict = {
        "compressionlevel": -1,
        "editorsettings": {"export": {"format": "json", "target": "map.json"}},
        "height": H,
        "infinite": False,
        "nextlayerid": 12,
        "nextobjectid": next_obj_id,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": "1.7.0",
        "tileheight": TILE_SIZE,
        "tilewidth": TILE_SIZE,
        "tilesets": tilesets,
        "type": "map",
        "version": 1.6,
        "width": W,
        "layers": layers
    }

    # Backup original map if not backed up yet
    if not os.path.exists(BACKUP_MAP) and os.path.exists(TARGET_MAP):
        shutil.copy(TARGET_MAP, BACKUP_MAP)
        print(f"Backed up original map to {BACKUP_MAP}")

    # Write both to map_great_hall.json and active map.json
    with open(GREAT_HALL_MAP, 'w') as f:
        json.dump(map_dict, f, indent=2)
    print(f"Saved: {GREAT_HALL_MAP}")

    with open(TARGET_MAP, 'w') as f:
        json.dump(map_dict, f, indent=2)
    print(f"Active map updated: {TARGET_MAP}")

    # Also sync to dist if present
    if os.path.exists(DIST_MAP_DIR):
        dist_target = os.path.join(DIST_MAP_DIR, 'map.json')
        with open(dist_target, 'w') as f:
            json.dump(map_dict, f, indent=2)
        print(f"Dist map updated: {dist_target}")

    # Update spawn position in Game.ts
    update_game_spawn()

    return map_dict

def update_game_spawn():
    if not os.path.exists(GAME_TS_PATH):
        print(f"Game.ts not found at {GAME_TS_PATH}")
        return

    with open(GAME_TS_PATH, 'r') as f:
        content = f.read()

    # Replace spawn coordinates: entrance foyer is at (416, 608)
    old_spawn = "this.add.myPlayer(705, 500,"
    new_spawn = "this.add.myPlayer(416, 608,"

    if old_spawn in content:
        content = content.replace(old_spawn, new_spawn)
        with open(GAME_TS_PATH, 'w') as f:
            f.write(content)
        print(f"Updated player spawn in Game.ts to (416, 608) at the Grand Oak Entrance!")
    elif new_spawn in content:
        print(f"Player spawn in Game.ts already at (416, 608).")
    else:
        print("Note: Could not find exact spawn line pattern in Game.ts; please verify.")

if __name__ == '__main__':
    build_great_hall_map()
