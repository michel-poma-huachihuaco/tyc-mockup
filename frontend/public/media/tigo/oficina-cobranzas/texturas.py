from PIL import Image, ImageDraw, ImageFont
import math, os
F='/home/jp_admin/Documentos/dev/aybar-front-web/public/fuente_montserrat/'
def f(w,s): return ImageFont.truetype(F+f'Montserrat-{w}.ttf', s)
P0,P1,P2='#02232A','#02424E','#03677A'; AMB='#F6A42C'; VER='#1F6B4A'; CL='#EEF3F4'
O='tex/'
# pizarra 7 pasos
im=Image.new('RGB',(1600,1000),'#FBFCFC'); d=ImageDraw.Draw(im)
d.text((80,60),'Ciclo de cobranza · 08:00',font=f('Bold',72),fill=P0)
pasos=['Sincronizar','Preparar','Evaluar promesas','Constancias','Procesar contratos','Materializar acciones','Estados de cuenta']
for i,p in enumerate(pasos):
    y=200+i*110; c=VER if i<3 else (AMB if i==3 else P2)
    d.ellipse((90,y,170,y+80),fill=c); d.text((130,y+40),str(i+1),font=f('Bold',48),fill='white',anchor='mm')
    d.text((210,y+40),p,font=f('SemiBold',54),fill=P0,anchor='lm')
    if i<3: d.line((1380,y+40,1410,y+70,1470,y+10),fill=VER,width=14)
d.rectangle((0,0,1599,999),outline='#9DB3B8',width=10)
im.save(O+'pizarra.png')
# calendario
im=Image.new('RGB',(700,800),'white'); d=ImageDraw.Draw(im)
d.rectangle((0,0,700,170),fill=P2); d.text((350,85),'OCTUBRE',font=f('Bold',70),fill='white',anchor='mm')
for i in range(35):
    x=40+(i%7)*90; y=210+(i//7)*115; n=i-2
    if 1<=n<=31:
        fill=AMB if n in (22,) else ('#F2D0CC' if n in (5,12,19,26) else '#EEF3F4')
        d.rounded_rectangle((x,y,x+78,y+100),12,fill=fill)
        d.text((x+39,y+50),str(n),font=f('SemiBold',38),fill=P0,anchor='mm')
im.save(O+'calendario.png')
# tablero de score / gráfico
im=Image.new('RGB',(1200,800),'#FBFCFC'); d=ImageDraw.Draw(im)
d.text((60,40),'Score de pago',font=f('Bold',64),fill=P0)
cols=['#7FB3BC','#FFD27A','#F6A42C','#D9781F','#B4532A']; hs=[520,330,220,140,90]
for i,(c,h) in enumerate(zip(cols,hs)):
    x=90+i*210; d.rounded_rectangle((x,720-h,x+150,720),14,fill=c)
d.line((60,720,1140,720),fill=P1,width=6)
pts=[(165,330),(375,300),(585,250),(795,210),(1005,160)]
d.line(pts,fill=P2,width=12)
for p in pts: d.ellipse((p[0]-18,p[1]-18,p[0]+18,p[1]+18),fill=P2)
im.save(O+'grafico.png')
# mapa
im=Image.new('RGB',(1200,900),'#CFE6D2'); d=ImageDraw.Draw(im)
d.polygon([(0,600),(250,520),(420,640),(700,560),(1200,700),(1200,900),(0,900)],fill='#7FC3D8')
d.polygon([(80,80),(520,40),(640,300),(380,460),(120,380)],fill='#9FD08F',outline='#4F8F4A',width=6)
d.polygon([(700,90),(1120,140),(1080,470),(760,420)],fill='#E8D58A',outline='#B39A3C',width=6)
for (a,b) in [((0,300),(1200,250)),((600,0),(560,900)),((200,0),(300,900))]:
    d.line((a,b),fill='#F7F2E6',width=30)
for x,y in [(300,250),(900,280),(450,620),(820,560)]:
    d.ellipse((x-14,y-14,x+14,y+14),outline=P1,width=5)
im.save(O+'mapa.png')
# reloj
im=Image.new('RGBA',(800,800),(0,0,0,0)); d=ImageDraw.Draw(im)
d.ellipse((10,10,790,790),fill='white')
for i in range(60):
    a=math.radians(i*6); r1=370; r2=340 if i%5==0 else 355
    d.line((400+r1*math.sin(a),400-r1*math.cos(a),400+r2*math.sin(a),400-r2*math.cos(a)),fill=P0,width=12 if i%5==0 else 4)
for h in range(1,13):
    a=math.radians(h*30); d.text((400+280*math.sin(a),400-280*math.cos(a)),str(h),font=f('Bold',62),fill=P0,anchor='mm')
im.save(O+'reloj.png')
# monitores
def pantalla(nombre,tipo,color):
    im=Image.new('RGB',(640,400),'#0D2F36'); d=ImageDraw.Draw(im)
    d.rectangle((0,0,640,46),fill=color)
    if tipo=='barras':
        for i in range(7):
            h=60+((i*53)%180); d.rectangle((50+i*80,360-h,100+i*80,360),fill=['#7FB3BC','#F6A42C','#7FD3A8'][i%3])
    elif tipo=='lista':
        for i in range(7):
            d.rounded_rectangle((40,80+i*44,600,112+i*44),8,fill='#1B4A53')
            d.rectangle((52,88+i*44,52+((i*97)%300)+120,104+i*44),fill=['#7FB3BC','#FFD27A','#7FD3A8'][i%3])
    elif tipo=='kanban':
        for c in range(4):
            for r in range(1+(c*3+1)%4):
                d.rounded_rectangle((30+c*152,80+r*70,160+c*152,135+r*70),8,fill=['#FFD27A','#7FB3BC','#F6A42C','#7FD3A8'][c])
    im.save(O+f'pantalla-{nombre}.png')
pantalla('a','barras','#03677A'); pantalla('b','lista','#F6A42C'); pantalla('c','kanban','#1F6B4A')
# rótulos
for n in ['Gestor','Legal','Finanzas','Abogado guardián','Salida a clientes']:
    w=1000 if len(n)>8 else 700
    im=Image.new('RGB',(w,220),P0); d=ImageDraw.Draw(im)
    d.text((w/2,110),n,font=f('Bold',100 if len(n)<10 else 84),fill='white',anchor='mm')
    im.save(O+'rotulo-'+n.split()[0].lower()+'.png')
# papel escrito
im=Image.new('RGB',(600,800),'#FFFDF6'); d=ImageDraw.Draw(im)
d.text((60,60),'Carta',font=f('Bold',60),fill=P0)
for i in range(12): d.line((60,190+i*48,60+(440 if i%4!=3 else 260),190+i*48),fill='#9AA9AD',width=8)
im.save(O+'papel.png')
# logo Aybar simple para la pared
im=Image.new('RGBA',(1600,220),(0,0,0,0)); d=ImageDraw.Draw(im)
d.text((800,110),'Oficina de Cobranzas',font=f('Bold',130),fill=P1,anchor='mm')
im.save(O+'logo.png')
print('ok')
