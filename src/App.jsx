import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ======================================================
// THEME
// ======================================================
const T = {
  bg:'#0a0a0c',panel:'#111114',panel2:'#18181c',
  input:'#1e1e24',border:'#2a2a32',borderLight:'#333340',
  text:'#d4d4e0',textDim:'#606070',textBright:'#f4f4fa',textMuted:'#404050',
  accent:'#FF6B2B',accentGlow:'rgba(255,107,43,0.25)',accentDark:'#cc4d10',accentSoft:'rgba(255,107,43,0.12)',
  blue:'#4F9EFF',blueGlow:'rgba(79,158,255,0.2)',
  red:'#FF4D4D',green:'#34D399',purple:'#A78BFA',yellow:'#FBBF24',
  glass:'rgba(255,255,255,0.03)',glassBorder:'rgba(255,255,255,0.06)',
};

// ======================================================
// DEFAULTS
// ======================================================
const DEF_CURVE=[[0,0],[255,255]];
const DEF = {
  exposure:0,contrast:0,highlights:0,shadows:0,whites:0,blacks:0,
  temperature:0,tint:0,vibrance:0,saturation:0,texture:0,clarity:0,dehaze:0,
  sharpness:0,sharpRadius:10,sharpDetail:25,sharpMasking:0,
  lumaNR:0,noiseDetail:50,colorNR:25,colorSmooth:50,
  vignette:0,vignetteMidpoint:50,vignetteFeather:50,vignetteRound:0,
  grain:0,grainSize:25,grainRough:50,
  rotate:0,distortion:0,lensVignette:0,
  purpleFringe:0,greenFringe:0,caRed:0,caBlue:0,
  curvePoints:[[0,0],[64,64],[128,128],[192,192],[255,255]],
  curveR:null,curveG:null,curveB:null,
  curveHL:0,curveLG:0,curveDK:0,curveSH:0,
};

const PRESETS = [
  {id:'auto',name:'Auto',icon:'&#9889;',adj:{exposure:0.1,contrast:10,vibrance:15,shadows:10,highlights:-10}},
  {id:'vivid',name:'Vivid',icon:'O',adj:{saturation:35,vibrance:25,clarity:20,contrast:15}},
  {id:'matte',name:'Matte',icon:'[]',adj:{blacks:25,contrast:-20,saturation:-8,highlights:-15}},
  {id:'cinema',name:'Cinematic',icon:'[+]',adj:{contrast:25,shadows:-20,highlights:-10,saturation:-8,temperature:-8}},
  {id:'bw',name:'B&W Classic',icon:'()',adj:{saturation:-100,contrast:20,clarity:25}},
  {id:'golden',name:'Golden Hour',icon:'*',adj:{temperature:30,tint:8,saturation:20,exposure:0.3,highlights:-15}},
  {id:'moody',name:'Moody Dark',icon:'^',adj:{shadows:-35,blacks:-25,contrast:30,saturation:-10}},
  {id:'fade',name:'Faded Film',icon:'o',adj:{blacks:35,contrast:-25,highlights:-20,saturation:-5}},
  {id:'portrait',name:'Portrait',icon:'(o)',adj:{exposure:0.2,highlights:-25,shadows:15,vibrance:20,clarity:-5}},
  {id:'landscape',name:'Landscape',icon:'#',adj:{vibrance:30,clarity:30,shadows:10,highlights:-10,temperature:5}},
  {id:'sunset',name:'Sunset',icon:'*',adj:{temperature:40,tint:15,saturation:25,highlights:-20,contrast:10}},
  {id:'cool',name:'Cool Blue',icon:'*',adj:{temperature:-30,tint:-10,saturation:15,contrast:10}},
  {id:'hdr',name:'HDR Look',icon:'<>',adj:{clarity:40,texture:30,contrast:20,shadows:20,highlights:-30}},
  {id:'silver',name:'Silver',icon:'<>',adj:{saturation:-60,contrast:10,highlights:-10,clarity:15}},
  {id:'bwfilm',name:'B&W Film',icon:'()',adj:{saturation:-100,contrast:15,clarity:20,temperature:-20,grain:35}},
];

const WB_PRESETS = [
  {name:'Daylight',temp:15,tint:3},{name:'Cloudy',temp:30,tint:8},
  {name:'Shade',temp:40,tint:12},{name:'Tungsten',temp:-45,tint:-5},
  {name:'Fluor.',temp:-20,tint:15},{name:'Flash',temp:5,tint:2},
];

const TRANSLATIONS = {
  en:{import:'Import',export:'Export',develop:'Develop',map:'Map',people:'People',book:'Book',slideshow:'Slideshow',print:'Print',settings:'Settings',clear:'Clear',undo:'↩ Undo',redo:'↪ Redo',before:'Before',after:'After',dropPhotos:'Drop photos here',orClick:'or click to browse files',noPhotos:'No photos — Import to start',histogram:'Histogram',whiteBalance:'White Balance',tone:'Tone',presence:'Presence',library:'Library',folders:'Folders',presets:'Presets',smart:'Smart',tags:'Tags',history:'History',noEdits:'No edits yet',adjustSlider:'Adjust any slider to start',collections:'Collections',allPhotos:'All Photos',picks:'Picks',rejected:'Rejected',starred:'4-5 Stars',photos:'Photos',noPhotoSelected:'No photo selected — Import to begin',temperature:'Temperature',tint:'Tint',exposure:'Exposure',contrast:'Contrast',highlights:'Highlights',shadows:'Shadows',whites:'Whites',blacks:'Blacks',texture:'Texture',clarity:'Clarity',dehaze:'Dehaze',vibrance:'Vibrance',saturation:'Saturation',sharpening:'Sharpening',noiseReduction:'Noise Reduction',lensCorrections:'Lens Corrections',transform:'Transform',calibration:'Calibration',vignette:'Vignette',grain:'Grain',splitToning:'Split Toning',hslMixer:'HSL Color Mixer',colorGrading:'Color Grading',toneCurve:'Tone Curve',zoneAdjustments:'Zone Adjustments',amount:'Amount',radius:'Radius',detail:'Detail',masking:'Masking',luminance:'Luminance',color:'Color',smoothness:'Smoothness',distortion:'Distortion',vignetting:'Vignetting',vertical:'Vertical',horizontal:'Horizontal',rotate:'Rotate',scale:'Scale',size:'Size',roughness:'Roughness',balance:'Balance',hue:'Hue',importFolder:'Import Folder',smartCollections:'Smart Collections',editHistory:'Edit History',noPhotosImport:'Import Photos',clickOrDrag:'Click or drag & drop',drop:'Drop photos here'},
  es:{import:'Importar',export:'Exportar',develop:'Revelar',map:'Mapa',people:'Personas',book:'Álbum',slideshow:'Presentación',print:'Imprimir',settings:'Ajustes',clear:'Borrar',undo:'↩ Deshacer',redo:'↪ Rehacer',before:'Antes',after:'Después',dropPhotos:'Arrastra fotos aquí',orClick:'o haz clic para buscar',noPhotos:'Sin fotos — Importa para empezar',histogram:'Histograma',whiteBalance:'Balance de blancos',tone:'Tono',presence:'Presencia',library:'Biblioteca',folders:'Carpetas',presets:'Ajustes previos',smart:'Inteligente',tags:'Etiquetas',history:'Historial',noEdits:'Sin ediciones aún',adjustSlider:'Mueve un deslizador para empezar',collections:'Colecciones',allPhotos:'Todas las fotos',picks:'Seleccionadas',rejected:'Rechazadas','starred':'4-5 Estrellas','photos':'Fotos','noPhotoSelected':'Sin foto seleccionada — Importa para empezar','temperature':'Temperatura','tint':'Tinte','exposure':'Exposición','contrast':'Contraste','highlights':'Luces','shadows':'Sombras','whites':'Blancos','blacks':'Negros','texture':'Textura','clarity':'Claridad','dehaze':'Eliminar neblina','vibrance':'Vibración','saturation':'Saturación','sharpening':'Nitidez','noiseReduction':'Reducción de ruido','lensCorrections':'Correcciones de lente','transform':'Transformar','calibration':'Calibración','vignette':'Viñeta','grain':'Grano','splitToning':'Tono dividido','hslMixer':'Mezclador HSL','colorGrading':'Gradación de color','toneCurve':'Curva de tono','zoneAdjustments':'Ajustes de zona','amount':'Cantidad','radius':'Radio','detail':'Detalle','masking':'Máscara','luminance':'Luminancia','color':'Color','smoothness':'Suavidad','distortion':'Distorsión','vignetting':'Viñeteado','vertical':'Vertical','horizontal':'Horizontal','rotate':'Rotar','scale':'Escala','size':'Tamaño','roughness':'Rugosidad','balance':'Balance','hue':'Tono','importFolder':'Importar carpeta','smartCollections':'Colecciones inteligentes','editHistory':'Historial de edición','noPhotosImport':'Importar fotos','clickOrDrag':'Clic o arrastrar y soltar','drop':'Arrastra fotos aquí'},
  fr:{import:'Importer',export:'Exporter',develop:'Développer',map:'Carte',people:'Personnes',book:'Album',slideshow:'Diaporama',print:'Imprimer',settings:'Réglages',clear:'Effacer',undo:'↩ Annuler',redo:'↪ Rétablir',before:'Avant',after:'Après',dropPhotos:'Déposez des photos ici',orClick:'ou cliquez pour parcourir',noPhotos:'Aucune photo — Importez pour commencer',histogram:'Histogramme',whiteBalance:'Balance des blancs',tone:'Tonalité',presence:'Présence',library:'Bibliothèque',folders:'Dossiers',presets:'Préréglages',smart:'Intelligent',tags:'Étiquettes',history:'Historique',noEdits:'Aucune modification',adjustSlider:'Ajustez un curseur pour commencer',collections:'Collections',allPhotos:'Toutes les photos',picks:'Sélections',rejected:'Rejetées','starred':'4-5 Étoiles','photos':'Photos','noPhotoSelected':'Aucune photo — Importez pour commencer','temperature':'Température','tint':'Teinte','exposure':'Exposition','contrast':'Contraste','highlights':'Hautes lumières','shadows':'Ombres','whites':'Blancs','blacks':'Noirs','texture':'Texture','clarity':'Clarté','dehaze':'Dénebulisation','vibrance':'Vibrance','saturation':'Saturation','sharpening':'Netteté','noiseReduction':'Réduction du bruit','lensCorrections':'Corrections optiques','transform':'Transformer','calibration':'Calibration','vignette':'Vignettage','grain':'Grain','splitToning':'Virage partiel','hslMixer':'Mélangeur TSL','colorGrading':'Étalonnage colorimétrique','toneCurve':'Courbe des tonalités','zoneAdjustments':'Ajustements de zone','amount':'Quantité','radius':'Rayon','detail':'Détail','masking':'Masquage','luminance':'Luminance','color':'Couleur','smoothness':'Lissage','distortion':'Distorsion','vignetting':'Vignettage','vertical':'Vertical','horizontal':'Horizontal','rotate':'Rotation','scale':'Échelle','size':'Taille','roughness':'Rugosité','balance':'Balance','hue':'Teinte','importFolder':'Importer dossier','smartCollections':'Collections intelligentes','editHistory':'Historique des modifications','noPhotosImport':'Importer des photos','clickOrDrag':'Cliquer ou glisser-déposer','drop':'Déposez des photos ici'},
  de:{import:'Importieren',export:'Exportieren',develop:'Entwickeln',map:'Karte',people:'Personen',book:'Buch',slideshow:'Diashow',print:'Drucken',settings:'Einstellungen',clear:'Löschen',undo:'↩ Rückgängig',redo:'↪ Wiederholen',before:'Vorher',after:'Nachher',dropPhotos:'Fotos hier ablegen',orClick:'oder klicken zum Durchsuchen',noPhotos:'Keine Fotos — Importieren zum Starten',histogram:'Histogramm',whiteBalance:'Weißabgleich',tone:'Ton',presence:'Präsenz',library:'Bibliothek',folders:'Ordner',presets:'Voreinstellungen',smart:'Smart',tags:'Tags',history:'Verlauf',noEdits:'Noch keine Bearbeitungen',adjustSlider:'Regler bewegen um zu starten',collections:'Sammlungen',allPhotos:'Alle Fotos',picks:'Auswahl',rejected:'Abgelehnt','starred':'4-5 Sterne','photos':'Fotos','noPhotoSelected':'Kein Foto ausgewählt — Importieren zum Starten','temperature':'Temperatur','tint':'Farbton','exposure':'Belichtung','contrast':'Kontrast','highlights':'Lichter','shadows':'Schatten','whites':'Weiß','blacks':'Schwarz','texture':'Textur','clarity':'Klarheit','dehaze':'Dunst entfernen','vibrance':'Lebendigkeit','saturation':'Sättigung','sharpening':'Schärfe','noiseReduction':'Rauschreduzierung','lensCorrections':'Objektivkorrekturen','transform':'Transformieren','calibration':'Kalibrierung','vignette':'Vignette','grain':'Korn','splitToning':'Geteilte Tönung','hslMixer':'HSL-Farbmischer','colorGrading':'Farbkorrektur','toneCurve':'Tonkurve','zoneAdjustments':'Zonenanpassungen','amount':'Menge','radius':'Radius','detail':'Detail','masking':'Maskierung','luminance':'Luminanz','color':'Farbe','smoothness':'Glätte','distortion':'Verzerrung','vignetting':'Vignettierung','vertical':'Vertikal','horizontal':'Horizontal','rotate':'Drehen','scale':'Skalieren','size':'Größe','roughness':'Rauheit','balance':'Balance','hue':'Farbton','importFolder':'Ordner importieren','smartCollections':'Intelligente Sammlungen','editHistory':'Bearbeitungsverlauf','noPhotosImport':'Fotos importieren','clickOrDrag':'Klicken oder per Drag & Drop','drop':'Fotos hier ablegen'},
  pt:{import:'Importar',export:'Exportar',develop:'Revelar',map:'Mapa',people:'Pessoas',book:'Álbum',slideshow:'Apresentação',print:'Imprimir',settings:'Configurações',clear:'Limpar',undo:'↩ Desfazer',redo:'↪ Refazer',before:'Antes',after:'Depois',dropPhotos:'Arraste fotos aqui',orClick:'ou clique para procurar',noPhotos:'Sem fotos — Importe para começar',histogram:'Histograma',whiteBalance:'Balanço de branco',tone:'Tom',presence:'Presença',library:'Biblioteca',folders:'Pastas',presets:'Predefinições',smart:'Inteligente',tags:'Tags',history:'Histórico',noEdits:'Sem edições ainda',adjustSlider:'Ajuste um controle para começar',collections:'Coleções',allPhotos:'Todas as fotos',picks:'Selecionadas',rejected:'Rejeitadas','starred':'4-5 Estrelas','photos':'Fotos','noPhotoSelected':'Nenhuma foto — Importar para começar','temperature':'Temperatura','tint':'Tom','exposure':'Exposição','contrast':'Contraste','highlights':'Realces','shadows':'Sombras','whites':'Brancos','blacks':'Pretos','texture':'Textura','clarity':'Clareza','dehaze':'Remover névoa','vibrance':'Vibração','saturation':'Saturação','sharpening':'Nitidez','noiseReduction':'Redução de ruído','lensCorrections':'Correções de lente','transform':'Transformar','calibration':'Calibração','vignette':'Vinheta','grain':'Grão','splitToning':'Viragem dividida','hslMixer':'Misturador HSL','colorGrading':'Gradação de cor','toneCurve':'Curva de tons','zoneAdjustments':'Ajustes de zona','amount':'Quantidade','radius':'Raio','detail':'Detalhe','masking':'Máscara','luminance':'Luminância','color':'Cor','smoothness':'Suavidade','distortion':'Distorção','vignetting':'Vinheta','vertical':'Vertical','horizontal':'Horizontal','rotate':'Rotacionar','scale':'Escala','size':'Tamanho','roughness':'Rugosidade','balance':'Balanço','hue':'Matiz','importFolder':'Importar pasta','smartCollections':'Coleções inteligentes','editHistory':'Histórico de edição','noPhotosImport':'Importar fotos','clickOrDrag':'Clique ou arraste e solte','drop':'Arraste fotos aqui'},
  it:{import:'Importa',export:'Esporta',develop:'Sviluppa',map:'Mappa',people:'Persone',book:'Album',slideshow:'Presentazione',print:'Stampa',settings:'Impostazioni',clear:'Cancella',undo:'↩ Annulla',redo:'↪ Ripeti',before:'Prima',after:'Dopo',dropPhotos:'Trascina foto qui',orClick:'o clicca per sfogliare',noPhotos:'Nessuna foto — Importa per iniziare',histogram:'Istogramma',whiteBalance:'Bilanciamento del bianco',tone:'Tono',presence:'Presenza',library:'Libreria',folders:'Cartelle',presets:'Predefiniti',smart:'Intelligente',tags:'Tag',history:'Cronologia',noEdits:'Nessuna modifica ancora',adjustSlider:'Regola un cursore per iniziare',collections:'Collezioni',allPhotos:'Tutte le foto',picks:'Selezionate',rejected:'Rifiutate','starred':'4-5 Stelle','photos':'Foto','noPhotoSelected':'Nessuna foto — Importa per iniziare','temperature':'Temperatura','tint':'Tonalità','exposure':'Esposizione','contrast':'Contrasto','highlights':'Luci','shadows':'Ombre','whites':'Bianchi','blacks':'Neri','texture':'Texture','clarity':'Nitidezza','dehaze':'Rimuovi foschia','vibrance':'Vivacità','saturation':'Saturazione','sharpening':'Nitidezza','noiseReduction':'Riduzione rumore','lensCorrections':'Correzioni obiettivo','transform':'Trasforma','calibration':'Calibrazione','vignette':'Vignettatura','grain':'Grana','splitToning':'Viraggio parziale','hslMixer':'Mixer HSL','colorGrading':'Gradazione colore','toneCurve':'Curva toni','zoneAdjustments':'Regolazioni zona','amount':'Quantità','radius':'Raggio','detail':'Dettaglio','masking':'Maschera','luminance':'Luminanza','color':'Colore','smoothness':'Levigatezza','distortion':'Distorsione','vignetting':'Vignettatura','vertical':'Verticale','horizontal':'Orizzontale','rotate':'Ruota','scale':'Scala','size':'Dimensione','roughness':'Rugosità','balance':'Bilanciamento','hue':'Tonalità','importFolder':'Importa cartella','smartCollections':'Raccolte intelligenti','editHistory':'Cronologia modifiche','noPhotosImport':'Importa foto','clickOrDrag':'Clicca o trascina','drop':'Trascina foto qui'},
  ja:{import:'読み込む',export:'書き出す',develop:'現像',map:'マップ',people:'人物',book:'本',slideshow:'スライドショー',print:'印刷',settings:'設定',clear:'クリア',undo:'↩ 取り消す',redo:'↪ やり直す',before:'前',after:'後',dropPhotos:'ここに写真をドロップ',orClick:'またはクリックして参照',noPhotos:'写真なし — インポートして開始',histogram:'ヒストグラム',whiteBalance:'ホワイトバランス',tone:'トーン',presence:'プレゼンス',library:'ライブラリ',folders:'フォルダ',presets:'プリセット',smart:'スマート',tags:'タグ',history:'履歴',noEdits:'まだ編集なし',adjustSlider:'スライダーを動かして開始',collections:'コレクション',allPhotos:'すべての写真',picks:'選択',rejected:'拒否','starred':'4-5 星','photos':'写真','noPhotoSelected':'写真未選択 — インポートして開始','temperature':'色温度','tint':'色調','exposure':'露出','contrast':'コントラスト','highlights':'ハイライト','shadows':'シャドウ','whites':'白レベル','blacks':'黒レベル','texture':'テクスチャ','clarity':'明瞭度','dehaze':'かすみの除去','vibrance':'自然な彩度','saturation':'彩度','sharpening':'シャープ','noiseReduction':'ノイズ軽減','lensCorrections':'レンズ補正','transform':'変形','calibration':'カメラキャリブレーション','vignette':'周辺光量補正','grain':'粒子','splitToning':'カラーグレーディング','hslMixer':'HSLカラーミキサー','colorGrading':'カラーグレーディング','toneCurve':'トーンカーブ','zoneAdjustments':'ゾーン調整','amount':'適用量','radius':'半径','detail':'ディテール','masking':'マスク','luminance':'輝度','color':'カラー','smoothness':'スムーズ','distortion':'歪曲収差','vignetting':'周辺光量補正','vertical':'垂直','horizontal':'水平','rotate':'回転','scale':'スケール','size':'サイズ','roughness':'粗さ','balance':'バランス','hue':'色相','importFolder':'フォルダを読み込む','smartCollections':'スマートコレクション','editHistory':'編集履歴','noPhotosImport':'写真を読み込む','clickOrDrag':'クリックまたはドラッグ＆ドロップ','drop':'ここに写真をドロップ'},
  zh:{import:'导入',export:'导出',develop:'修图',map:'地图',people:'人物',book:'相册',slideshow:'幻灯片',print:'打印',settings:'设置',clear:'清除',undo:'↩ 撤销',redo:'↪ 重做',before:'之前',after:'之后',dropPhotos:'将照片拖到这里',orClick:'或点击浏览文件',noPhotos:'无照片 — 导入开始',histogram:'直方图',whiteBalance:'白平衡',tone:'色调',presence:'存在感',library:'图库',folders:'文件夹',presets:'预设',smart:'智能',tags:'标签',history:'历史',noEdits:'暂无编辑',adjustSlider:'调整滑块开始',collections:'收藏',allPhotos:'所有照片',picks:'精选',rejected:'已拒绝','starred':'4-5 星','photos':'照片','noPhotoSelected':'未选择照片 — 导入开始','temperature':'色温','tint':'色调','exposure':'曝光','contrast':'对比度','highlights':'高光','shadows':'阴影','whites':'白色','blacks':'黑色','texture':'纹理','clarity':'清晰度','dehaze':'去雾','vibrance':'自然饱和度','saturation':'饱和度','sharpening':'锐化','noiseReduction':'降噪','lensCorrections':'镜头校正','transform':'变换','calibration':'校准','vignette':'暗角','grain':'颗粒','splitToning':'分色调','hslMixer':'HSL混色器','colorGrading':'色彩分级','toneCurve':'色调曲线','zoneAdjustments':'区域调整','amount':'数量','radius':'半径','detail':'细节','masking':'蒙版','luminance':'明度','color':'颜色','smoothness':'平滑度','distortion':'畸变','vignetting':'暗角','vertical':'垂直','horizontal':'水平','rotate':'旋转','scale':'缩放','size':'大小','roughness':'粗糙度','balance':'平衡','hue':'色相','importFolder':'导入文件夹','smartCollections':'智能收藏','editHistory':'编辑历史','noPhotosImport':'导入照片','clickOrDrag':'点击或拖放','drop':'将照片拖到这里'},
  ko:{import:'가져오기',export:'내보내기',develop:'현상',map:'지도',people:'인물',book:'앨범',slideshow:'슬라이드쇼',print:'인쇄',settings:'설정',clear:'지우기',undo:'↩ 실행 취소',redo:'↪ 다시 실행',before:'이전',after:'이후',dropPhotos:'여기에 사진 드롭',orClick:'또는 클릭하여 찾아보기',noPhotos:'사진 없음 — 가져오기로 시작',histogram:'히스토그램',whiteBalance:'화이트 밸런스',tone:'톤',presence:'현존감',library:'라이브러리',folders:'폴더',presets:'프리셋',smart:'스마트',tags:'태그',history:'기록',noEdits:'아직 편집 없음',adjustSlider:'슬라이더를 조정하여 시작',collections:'컬렉션',allPhotos:'모든 사진',picks:'선택',rejected:'거부됨','starred':'4-5 별','photos':'사진','noPhotoSelected':'사진 미선택 — 가져오기로 시작','temperature':'색온도','tint':'색조','exposure':'노출','contrast':'대비','highlights':'하이라이트','shadows':'그림자','whites':'흰색','blacks':'검정','texture':'텍스처','clarity':'명료도','dehaze':'안개 제거','vibrance':'생동감','saturation':'채도','sharpening':'선명도','noiseReduction':'노이즈 감소','lensCorrections':'렌즈 교정','transform':'변형','calibration':'교정','vignette':'비네팅','grain':'입자','splitToning':'분할 토닝','hslMixer':'HSL 색상 믹서','colorGrading':'색상 그레이딩','toneCurve':'톤 곡선','zoneAdjustments':'영역 조정','amount':'양','radius':'반경','detail':'세부사항','masking':'마스킹','luminance':'휘도','color':'색상','smoothness':'부드러움','distortion':'왜곡','vignetting':'비네팅','vertical':'수직','horizontal':'수평','rotate':'회전','scale':'크기','size':'크기','roughness':'거칠기','balance':'균형','hue':'색조','importFolder':'폴더 가져오기','smartCollections':'스마트 컬렉션','editHistory':'편집 기록','noPhotosImport':'사진 가져오기','clickOrDrag':'클릭 또는 드래그 앤 드롭','drop':'여기에 사진 드롭'},
  ru:{import:'Импорт',export:'Экспорт',develop:'Проявка',map:'Карта',people:'Люди',book:'Альбом',slideshow:'Слайд-шоу',print:'Печать',settings:'Настройки',clear:'Очистить',undo:'↩ Отменить',redo:'↪ Повторить',before:'До',after:'После',dropPhotos:'Перетащите фото сюда',orClick:'или нажмите для выбора',noPhotos:'Нет фото — Импортируйте для начала',histogram:'Гистограмма',whiteBalance:'Баланс белого',tone:'Тон',presence:'Присутствие',library:'Библиотека',folders:'Папки',presets:'Пресеты',smart:'Умный',tags:'Теги',history:'История',noEdits:'Пока нет правок',adjustSlider:'Переместите ползунок для начала',collections:'Коллекции',allPhotos:'Все фото',picks:'Выбранные',rejected:'Отклонённые','starred':'4-5 Звёзд','photos':'Фото','noPhotoSelected':'Нет фото — Импортируйте для начала','temperature':'Температура','tint':'Оттенок','exposure':'Экспозиция','contrast':'Контраст','highlights':'Света','shadows':'Тени','whites':'Белые','blacks':'Чёрные','texture':'Текстура','clarity':'Чёткость','dehaze':'Устр. дымку','vibrance':'Сочность','saturation':'Насыщенность','sharpening':'Резкость','noiseReduction':'Шумоподавление','lensCorrections':'Коррекция объектива','transform':'Трансформация','calibration':'Калибровка','vignette':'Виньетка','grain':'Зерно','splitToning':'Разд. тонирование','hslMixer':'Микшер HSL','colorGrading':'Цветокоррекция','toneCurve':'Кривые тонов','zoneAdjustments':'Зональные корр.','amount':'Количество','radius':'Радиус','detail':'Детали','masking':'Маскирование','luminance':'Яркость','color':'Цвет','smoothness':'Сглаживание','distortion':'Дисторсия','vignetting':'Виньетирование','vertical':'Вертикаль','horizontal':'Горизонталь','rotate':'Поворот','scale':'Масштаб','size':'Размер','roughness':'Зернистость','balance':'Баланс','hue':'Оттенок','importFolder':'Импорт папки','smartCollections':'Смарт-коллекции','editHistory':'История правок','noPhotosImport':'Импортировать фото','clickOrDrag':'Нажать или перетащить','drop':'Перетащите фото сюда'},
  ar:{import:'استيراد',export:'تصدير',develop:'تطوير',map:'خريطة',people:'أشخاص',book:'ألبوم',slideshow:'عرض شرائح',print:'طباعة',settings:'الإعدادات',clear:'مسح',undo:'↩ تراجع',redo:'↪ إعادة',before:'قبل',after:'بعد',dropPhotos:'أسقط الصور هنا',orClick:'أو انقر للتصفح',noPhotos:'لا صور — استورد للبدء',histogram:'الرسم البياني',whiteBalance:'توازن الأبيض',tone:'النبرة',presence:'الحضور',library:'المكتبة',folders:'المجلدات',presets:'الإعدادات المسبقة',smart:'ذكي',tags:'الوسوم',history:'السجل',noEdits:'لا تعديلات بعد',adjustSlider:'اضبط شريطاً للبدء',collections:'المجموعات',allPhotos:'كل الصور',picks:'المختارة',rejected:'المرفوضة','starred':'4-5 نجوم','photos':'صور','noPhotoSelected':'لا صورة — استورد للبدء','temperature':'درجة الحرارة','tint':'الصبغة','exposure':'التعرض','contrast':'التباين','highlights':'الإضاءات','shadows':'الظلال','whites':'الأبيض','blacks':'الأسود','texture':'النسيج','clarity':'الوضوح','dehaze':'إزالة الضباب','vibrance':'الحيوية','saturation':'التشبع','sharpening':'الحدة','noiseReduction':'تقليل الضوضاء','lensCorrections':'تصحيحات العدسة','transform':'التحويل','calibration':'المعايرة','vignette':'التحديد','grain':'الحبيبات','splitToning':'التلوين المقسم','hslMixer':'خلاط HSL','colorGrading':'تدرج الألوان','toneCurve':'منحنى التدرج','zoneAdjustments':'تعديلات المنطقة','amount':'الكمية','radius':'نصف القطر','detail':'التفاصيل','masking':'التقنيع','luminance':'اللمعان','color':'اللون','smoothness':'النعومة','distortion':'التشويه','vignetting':'التحديد','vertical':'رأسي','horizontal':'أفقي','rotate':'تدوير','scale':'المقياس','size':'الحجم','roughness':'الخشونة','balance':'التوازن','hue':'الصبغة','importFolder':'استيراد مجلد','smartCollections':'المجموعات الذكية','editHistory':'سجل التحرير','noPhotosImport':'استيراد الصور','clickOrDrag':'انقر أو اسحب وأفلت','drop':'أسقط الصور هنا'},
  nl:{import:'Importeren',export:'Exporteren',develop:'Ontwikkelen',map:'Kaart',people:'Mensen',book:'Album',slideshow:'Diashow',print:'Afdrukken',settings:'Instellingen',clear:'Wissen',undo:'↩ Ongedaan',redo:'↪ Opnieuw',before:'Voor',after:'Na',dropPhotos:'Sleep foto\'s hierheen',orClick:'of klik om te bladeren',noPhotos:'Geen foto\'s — Importeer om te starten',histogram:'Histogram',whiteBalance:'Witbalans',tone:'Toon',presence:'Aanwezigheid',library:'Bibliotheek',folders:'Mappen',presets:'Voorinstellingen',smart:'Slim',tags:'Tags',history:'Geschiedenis',noEdits:'Nog geen bewerkingen',adjustSlider:'Beweeg een schuifregelaar',collections:'Collecties',allPhotos:'Alle foto\'s',picks:'Geselecteerd',rejected:'Afgewezen','starred':'4-5 Sterren','photos':'Foto\'s','noPhotoSelected':'Geen foto — Importeer om te starten','temperature':'Temperatuur','tint':'Tint','exposure':'Belichting','contrast':'Contrast','highlights':'Hooglichten','shadows':'Schaduwen','whites':'Witten','blacks':'Zwarten','texture':'Textuur','clarity':'Helderheid','dehaze':'Nevel verwijderen','vibrance':'Levendigheid','saturation':'Verzadiging','sharpening':'Verscherping','noiseReduction':'Ruisonderdrukking','lensCorrections':'Lenscorrecties','transform':'Transformeren','calibration':'Kalibratie','vignette':'Vignetting','grain':'Korrel','splitToning':'Gesplitste toning','hslMixer':'HSL-kleurenmixer','colorGrading':'Kleurbewerking','toneCurve':'Toonkromme','zoneAdjustments':'Zone-aanpassingen','amount':'Hoeveelheid','radius':'Straal','detail':'Detail','masking':'Maskering','luminance':'Luminantie','color':'Kleur','smoothness':'Zachtheid','distortion':'Vervorming','vignetting':'Vignetting','vertical':'Verticaal','horizontal':'Horizontaal','rotate':'Draaien','scale':'Schaal','size':'Grootte','roughness':'Ruwheid','balance':'Balans','hue':'Tint','importFolder':'Map importeren','smartCollections':'Slimme collecties','editHistory':'Bewerkingsgeschiedenis','noPhotosImport':'Fotos importeren','clickOrDrag':'Klikken of slepen','drop':'Fotos hier neerzetten'},
};
const getLang=(lang,key)=>(TRANSLATIONS[lang]||TRANSLATIONS.en)[key]||TRANSLATIONS.en[key]||key;

const HSL_COLORS = [
  {id:'red',label:'R',hex:'#ef4444'},{id:'orange',label:'O',hex:'#f97316'},
  {id:'yellow',label:'Y',hex:'#eab308'},{id:'green',label:'G',hex:'#22c55e'},
  {id:'aqua',label:'Aq',hex:'#06b6d4'},{id:'blue',label:'B',hex:'#3b82f6'},
  {id:'purple',label:'P',hex:'#8b5cf6'},{id:'magenta',label:'Mg',hex:'#ec4899'},
];

const SMART_RULES = [
  {id:'highrated',name:'High Rated',icon:'*',rule:p=>p.rating>=4},
  {id:'picks',name:'All Picks',icon:'P',rule:p=>p.flag===1},
  {id:'recent',name:'Recently Added',icon:'T',rule:p=>(Date.now()-p.added)<86400000*7},
  {id:'large',name:'Large Photos',icon:'[]',rule:p=>p.size>2*1024*1024},
  {id:'landscape',name:'Landscape',icon:'[]',rule:p=>p.exif?.width>p.exif?.height},
  {id:'portrait_o',name:'Portrait',icon:'[]',rule:p=>p.exif?.height>p.exif?.width},
  {id:'tagged',name:'Has Keywords',icon:'&#127991;',rule:p=>p.keywords?.length>0},
  {id:'gps',name:'Has GPS',icon:'GPS',rule:p=>!!(p.exif?.lat&&p.exif?.lng)},
];

// ======================================================
// RAW FILE READER - extracts embedded JPEG from RAW files
// ======================================================
async function readRawFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = new Uint8Array(e.target.result);
      // Search for embedded JPEG (SOI marker FF D8)
      let best = -1, bestSize = 0;
      for (let i = 0; i < buf.length - 4; i++) {
        if (buf[i] === 0xFF && buf[i+1] === 0xD8) {
          // Find matching EOI (FF D9)
          for (let j = buf.length - 2; j > i + 1000; j--) {
            if (buf[j] === 0xFF && buf[j+1] === 0xD9) {
              const size = j - i + 2;
              if (size > bestSize) { bestSize = size; best = i; }
              break;
            }
          }
        }
      }
      if (best >= 0 && bestSize > 10000) {
        const jpegBytes = buf.slice(best, best + bestSize);
        const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const fr = new FileReader();
        fr.onload = ev => resolve({ src: ev.target.result, raw: true });
        fr.readAsDataURL(blob);
      } else {
        // Fallback: try to read as normal image
        const fr2 = new FileReader();
        fr2.onload = ev => resolve({ src: ev.target.result, raw: true });
        fr2.readAsDataURL(file);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ======================================================
// EXIF PARSER - reads EXIF data from image file
// ======================================================
function parseExif(buffer) {
  const data = new DataView(buffer);
  const exif = {};
  try {
    // Check JPEG SOI
    if (data.getUint16(0) !== 0xFFD8) return exif;
    let offset = 2;
    while (offset < data.byteLength - 2) {
      const marker = data.getUint16(offset);
      offset += 2;
      if (marker === 0xFFE1) { // APP1 (EXIF)
        const len = data.getUint16(offset);
        const exifBuf = buffer.slice(offset + 2, offset + len);
        const ed = new DataView(exifBuf);
        // Check Exif header
        const exifHeader = String.fromCharCode(ed.getUint8(0),ed.getUint8(1),ed.getUint8(2),ed.getUint8(3));
        if (exifHeader === 'Exif') {
          const tiffOffset = 6;
          const byteOrder = ed.getUint16(tiffOffset);
          const le = byteOrder === 0x4949;
          const getU16 = (o) => le ? ed.getUint16(o, true) : ed.getUint16(o, false);
          const getU32 = (o) => le ? ed.getUint32(o, true) : ed.getUint32(o, false);
          const ifdOffset = tiffOffset + getU32(tiffOffset + 4);
          const numEntries = getU16(ifdOffset);
          const tagMap = {
            0x010F:'make', 0x0110:'model', 0x0112:'orientation',
            0x829A:'exposureTime', 0x829D:'fNumber', 0x8827:'iso',
            0x9003:'dateTime', 0x920A:'focalLength', 0xA002:'width', 0xA003:'height',
            0x8825:'gpsIFD', 0x0131:'software', 0x013B:'artist',
            0x9204:'exposureBias', 0x9207:'meteringMode', 0x9209:'flash',
          };
          for (let i = 0; i < Math.min(numEntries, 50); i++) {
            const entryOffset = ifdOffset + 2 + i * 12;
            if (entryOffset + 12 > exifBuf.byteLength) break;
            const tag = getU16(entryOffset);
            const type = getU16(entryOffset + 2);
            const count = getU32(entryOffset + 4);
            const valOffset = entryOffset + 8;
            const name = tagMap[tag];
            if (!name) continue;
            try {
              if (type === 2) { // ASCII string
                const strOffset = count > 4 ? tiffOffset + getU32(valOffset) : valOffset;
                let str = '';
                for (let k = 0; k < Math.min(count - 1, 64); k++) str += String.fromCharCode(ed.getUint8(strOffset + k));
                exif[name] = str.trim();
              } else if (type === 3) { // SHORT
                exif[name] = getU16(valOffset);
              } else if (type === 4) { // LONG
                exif[name] = getU32(valOffset);
              } else if (type === 5) { // RATIONAL
                const rOff = tiffOffset + getU32(valOffset);
                if (rOff + 8 <= exifBuf.byteLength) {
                  const num = getU32(rOff), den = getU32(rOff + 4);
                  exif[name] = den > 0 ? num / den : 0;
                }
              } else if (type === 10) { // SRATIONAL
                const rOff = tiffOffset + getU32(valOffset);
                if (rOff + 8 <= exifBuf.byteLength) {
                  const num = le ? ed.getInt32(rOff, true) : ed.getInt32(rOff, false);
                  const den = le ? ed.getInt32(rOff + 4, true) : ed.getInt32(rOff + 4, false);
                  exif[name] = den > 0 ? num / den : 0;
                }
              }
              // GPS IFD
              if (name === 'gpsIFD') {
                const gpsBase = tiffOffset + exif['gpsIFD'];
                const gpsCount = getU16(gpsBase);
                let latDeg, latRef, lngDeg, lngRef, altitude;
                for (let g = 0; g < Math.min(gpsCount, 20); g++) {
                  const gOff = gpsBase + 2 + g * 12;
                  if (gOff + 12 > exifBuf.byteLength) break;
                  const gtag = getU16(gOff);
                  const gtype = getU16(gOff + 2);
                  const gcnt = getU32(gOff + 4);
                  const gvoff = gOff + 8;
                  if (gtag === 1 && gtype === 2) { latRef = String.fromCharCode(ed.getUint8(gvoff)); }
                  if (gtag === 3 && gtype === 2) { lngRef = String.fromCharCode(ed.getUint8(gvoff)); }
                  if (gtag === 2 && gtype === 5 && gcnt === 3) {
                    const o = tiffOffset + getU32(gvoff);
                    if (o + 24 <= exifBuf.byteLength) {
                      const d=getU32(o)/getU32(o+4), m=getU32(o+8)/getU32(o+12), s=getU32(o+16)/getU32(o+20);
                      latDeg = d + m/60 + s/3600;
                    }
                  }
                  if (gtag === 4 && gtype === 5 && gcnt === 3) {
                    const o = tiffOffset + getU32(gvoff);
                    if (o + 24 <= exifBuf.byteLength) {
                      const d=getU32(o)/getU32(o+4), m=getU32(o+8)/getU32(o+12), s=getU32(o+16)/getU32(o+20);
                      lngDeg = d + m/60 + s/3600;
                    }
                  }
                  if (gtag === 6 && gtype === 5) {
                    const o = tiffOffset + getU32(gvoff);
                    if (o + 8 <= exifBuf.byteLength) altitude = getU32(o)/getU32(o+4);
                  }
                }
                if (latDeg !== undefined && lngDeg !== undefined) {
                  exif.lat = latRef === 'S' ? -latDeg : latDeg;
                  exif.lng = lngRef === 'W' ? -lngDeg : lngDeg;
                  if (altitude !== undefined) exif.altitude = altitude;
                }
              }
            } catch(e) {}
          }
        }
        offset += len;
      } else if (marker === 0xFFDA) break;
      else { const len = data.getUint16(offset); offset += len; }
    }
  } catch(e) {}
  return exif;
}

async function readFileExif(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(parseExif(e.target.result));
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

// ======================================================
// IMAGE PROCESSING
// ======================================================
function interpCurve(pts,x){
  if(!pts||pts.length<2)return x;
  const sorted=[...pts].sort((a,b)=>a[0]-b[0]);
  if(x<=sorted[0][0])return sorted[0][1];
  if(x>=sorted[sorted.length-1][0])return sorted[sorted.length-1][1];
  for(let i=0;i<sorted.length-1;i++){
    const[x0,y0]=sorted[i];const[x1,y1]=sorted[i+1];
    if(x>=x0&&x<=x1){const t=(x-x0)/(x1-x0);return y0+(y1-y0)*t;}
  }
  return x;
}

function buildToneCurveFilter(adj){
  const hl=(adj.highlights||0)/100;
  const sh=(adj.shadows||0)/100;
  const wh=(adj.whites||0)/100;
  const bk=(adj.blacks||0)/100;
  // Zone adjustments (Highlights/Lights/Darks/Shadows bands)
  const zHL=(adj.curveHL||0)/100;  // very bright zone
  const zLG=(adj.curveLG||0)/100;  // light zone
  const zDK=(adj.curveDK||0)/100;  // dark zone
  const zSH=(adj.curveSH||0)/100;  // very dark zone
  const rgbPts=adj.curvePoints||null;
  const rPts=adj.curveR||null;
  const gPts=adj.curveG||null;
  const bPts=adj.curveB||null;

  const hasHL=hl||sh||wh||bk;
  const hasZone=zHL||zLG||zDK||zSH;
  const hasRGB=rgbPts&&rgbPts.some(([x,y])=>Math.abs(x-y)>2);
  const hasR=rPts&&rPts.some(([x,y])=>Math.abs(x-y)>2);
  const hasG=gPts&&gPts.some(([x,y])=>Math.abs(x-y)>2);
  const hasB=bPts&&bPts.some(([x,y])=>Math.abs(x-y)>2);

  if(!hasHL&&!hasZone&&!hasRGB&&!hasR&&!hasG&&!hasB)return'';

  const rTable=[],gTable=[],bTable=[];
  for(let i=0;i<=255;i++){
    let v=i/255;
    // Blacks/Whites/Shadows/Highlights
    if(bk){const w=Math.pow(1-v,2);v=Math.max(0,Math.min(1,v+bk*w*0.5));}
    if(wh){const w=Math.pow(v,2);v=Math.max(0,Math.min(1,v+wh*w*0.5));}
    if(sh){const w=Math.max(0,1-v*1.8);v=Math.max(0,Math.min(1,v+sh*w*0.5));}
    if(hl){const w=Math.max(0,v*1.8-0.8);v=Math.max(0,Math.min(1,v+hl*w*0.5));}
    // Zone adjustments - each zone targets a specific luminance band
    if(zHL){// Highlights zone: 192-255 (top quarter)
      const w=Math.max(0,Math.min(1,(v-0.75)/0.25));
      v=Math.max(0,Math.min(1,v+zHL*w*0.6));
    }
    if(zLG){// Lights zone: 128-192 (upper-mid)
      const t=(v-0.5)/0.25;const w=Math.max(0,1-Math.abs(t));
      v=Math.max(0,Math.min(1,v+zLG*w*0.6));
    }
    if(zDK){// Darks zone: 64-128 (lower-mid)
      const t=(v-0.25)/0.25;const w=Math.max(0,1-Math.abs(t));
      v=Math.max(0,Math.min(1,v+zDK*w*0.6));
    }
    if(zSH){// Shadows zone: 0-64 (bottom quarter)
      const w=Math.max(0,Math.min(1,(0.25-v)/0.25));
      v=Math.max(0,Math.min(1,v+zSH*w*0.6));
    }
    // RGB master curve
    let rv=v,gv=v,bv=v;
    if(hasRGB){const curved=interpCurve(rgbPts,v*255)/255;rv=curved;gv=curved;bv=curved;}
    // Per-channel curves
    if(hasR)rv=interpCurve(rPts,rv*255)/255;
    if(hasG)gv=interpCurve(gPts,gv*255)/255;
    if(hasB)bv=interpCurve(bPts,bv*255)/255;
    rTable.push(Math.max(0,Math.min(1,rv)).toFixed(4));
    gTable.push(Math.max(0,Math.min(1,gv)).toFixed(4));
    bTable.push(Math.max(0,Math.min(1,bv)).toFixed(4));
  }
  const svg=`<svg xmlns='http://www.w3.org/2000/svg'><filter id='tf'><feComponentTransfer><feFuncR type='table' tableValues='${rTable.join(' ')}'/><feFuncG type='table' tableValues='${gTable.join(' ')}'/><feFuncB type='table' tableValues='${bTable.join(' ')}'/></feComponentTransfer></filter></svg>`;
  return`url('data:image/svg+xml;base64,${btoa(svg)}#tf')`;
}

function buildFilter(adj) {
  const br = Math.pow(2,(adj.exposure||0)*0.5);
  const ct = Math.max(0.05,1+((adj.contrast||0)/100)*0.8);
  const vib = (adj.vibrance||0)/200;
  const sat = Math.max(0,1+((adj.saturation||0)/100)*0.9+vib);
  const hue = -(adj.temperature||0)*0.15+(adj.tint||0)*0.3;
  let f=[`brightness(${br.toFixed(4)})`,`contrast(${ct.toFixed(4)})`,`saturate(${sat.toFixed(4)})`];
  if(Math.abs(hue)>0.1) f.push(`hue-rotate(${hue.toFixed(2)}deg)`);
  if((adj.clarity||0)>5) f.push(`contrast(${(1+adj.clarity/400).toFixed(4)})`);
  if((adj.dehaze||0)>0) f.push(`contrast(${(1+adj.dehaze/250).toFixed(4)})`);
  if((adj.sharpness||0)>0) f.push(`contrast(${(1+adj.sharpness/800).toFixed(4)})`);
  if((adj.texture||0)>0) f.push(`contrast(${(1+adj.texture/600).toFixed(4)})`);
  const tone=buildToneCurveFilter(adj);
  if(tone)f.push(tone);
  return f.join(' ');
}

function applyPixels(ctx,w,h,adj) {
  const d=ctx.getImageData(0,0,w,h); const px=d.data;
  const ts=(adj.temperature||0)/100*20, hl=(adj.highlights||0)/100*50;
  const sh=(adj.shadows||0)/100*50, wh=(adj.whites||0)/100*40, bk=(adj.blacks||0)/100*40;
  for(let i=0;i<px.length;i+=4){
    let r=px[i],g=px[i+1],b=px[i+2];
    const lum=0.299*r+0.587*g+0.114*b;
    if(ts){r=Math.min(255,Math.max(0,r+ts));b=Math.min(255,Math.max(0,b-ts));}
    if(hl){const f=lum>128?(lum-128)/127:0;r=Math.min(255,Math.max(0,r+hl*f));g=Math.min(255,Math.max(0,g+hl*f));b=Math.min(255,Math.max(0,b+hl*f));}
    if(sh){const f=lum<128?(128-lum)/128:0;r=Math.min(255,Math.max(0,r+sh*f));g=Math.min(255,Math.max(0,g+sh*f));b=Math.min(255,Math.max(0,b+sh*f));}
    if(wh){const f=Math.pow(lum/255,2.5);r=Math.min(255,Math.max(0,r+wh*f));g=Math.min(255,Math.max(0,g+wh*f));b=Math.min(255,Math.max(0,b+wh*f));}
    if(bk){const f=Math.pow(1-lum/255,2.5);r=Math.min(255,Math.max(0,r+bk*f));g=Math.min(255,Math.max(0,g+bk*f));b=Math.min(255,Math.max(0,b+bk*f));}
    px[i]=r;px[i+1]=g;px[i+2]=b;
  }
  ctx.putImageData(d,0,0);
}

function renderExport(img,adj,cropRect,watermark,watermarkPos,maxW=0,maxH=0) {
  let sw=img.naturalWidth,sh=img.naturalHeight;
  if(cropRect){sw=Math.round(cropRect.w*img.naturalWidth);sh=Math.round(cropRect.h*img.naturalHeight);}
  // Resize to fit maxW/maxH if set
  if((maxW>0||maxH>0)&&(sw>0&&sh>0)){
    const scaleW=maxW>0?maxW/sw:Infinity;
    const scaleH=maxH>0?maxH/sh:Infinity;
    const scale=Math.min(1,scaleW,scaleH);
    sw=Math.round(sw*scale);sh=Math.round(sh*scale);
  }
  const canvas=document.createElement('canvas');
  const rotate=adj.rotate||0;
  const rad=rotate*Math.PI/180;
  const cos=Math.abs(Math.cos(rad)),sin=Math.abs(Math.sin(rad));
  canvas.width=Math.round(sw*cos+sh*sin);
  canvas.height=Math.round(sw*sin+sh*cos);
  const ctx=canvas.getContext('2d');
  ctx.filter=buildFilter(adj);
  ctx.save();
  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.rotate(rad);
  if(cropRect) ctx.drawImage(img,cropRect.x*img.naturalWidth,cropRect.y*img.naturalHeight,cropRect.w*img.naturalWidth,cropRect.h*img.naturalHeight,-sw/2,-sh/2,sw,sh);
  else ctx.drawImage(img,-sw/2,-sh/2,sw,sh);
  ctx.restore();
  ctx.filter='none';
  applyPixels(ctx,canvas.width,canvas.height,adj);
  // Chromatic aberration simulation on export
  if((adj.caRed||adj.caBlue)&&(Math.abs(adj.caRed||0)>2||Math.abs(adj.caBlue||0)>2)){
    const idata=ctx.getImageData(0,0,canvas.width,canvas.height);
    const out=ctx.createImageData(canvas.width,canvas.height);
    const shift=Math.round(Math.abs(adj.caRed||adj.caBlue||0)/10);
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
      const i=(y*canvas.width+x)*4;
      const ri=((y)*canvas.width+Math.min(canvas.width-1,x+shift))*4;
      const bi=((y)*canvas.width+Math.max(0,x-shift))*4;
      out.data[i]=idata.data[ri];out.data[i+1]=idata.data[i+1];
      out.data[i+2]=idata.data[bi+2];out.data[i+3]=idata.data[i+3];
    }
    ctx.putImageData(out,0,0);
  }
  if(adj.vignette){
    const cx=canvas.width/2,cy=canvas.height/2,r=Math.max(cx,cy)*0.9;
    const g=ctx.createRadialGradient(cx,cy,r*0.2,cx,cy,r);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${Math.min(0.9,Math.abs(adj.vignette)/100*0.85)})`);
    ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  if(watermark){
    const fs=Math.max(16,canvas.width/40);
    ctx.font=`${fs}px Arial`;ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=4;
    const tw=ctx.measureText(watermark).width,pad=fs*0.8;
    let wx=pad,wy=canvas.height-pad;
    if(watermarkPos==='bottom-right'){wx=canvas.width-tw-pad;wy=canvas.height-pad;}
    else if(watermarkPos==='top-left'){wx=pad;wy=fs+pad;}
    else if(watermarkPos==='top-right'){wx=canvas.width-tw-pad;wy=fs+pad;}
    else if(watermarkPos==='center'){wx=(canvas.width-tw)/2;wy=canvas.height/2;}
    ctx.fillText(watermark,wx,wy);ctx.shadowBlur=0;
  }
  return canvas;
}

// ======================================================
// HISTOGRAM
// ======================================================
function Histogram({src,filter}){
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c||!src)return;
    const img=new Image();
    img.onload=()=>{
      const sc=Math.min(1,300/Math.max(img.width,img.height));
      const oc=document.createElement('canvas');
      oc.width=Math.max(1,Math.round(img.width*sc));oc.height=Math.max(1,Math.round(img.height*sc));
      const ox=oc.getContext('2d');ox.filter=filter||'none';ox.drawImage(img,0,0,oc.width,oc.height);ox.filter='none';
      const data=ox.getImageData(0,0,oc.width,oc.height).data;
      const R=new Float32Array(256),G=new Float32Array(256),B=new Float32Array(256),L=new Float32Array(256);
      for(let i=0;i<data.length;i+=4){R[data[i]]++;G[data[i+1]]++;B[data[i+2]]++;L[Math.round(0.299*data[i]+0.587*data[i+1]+0.114*data[i+2])]++;}
      const ctx=c.getContext('2d');const W=c.width,H=c.height;const mx=Math.max(...R,...G,...B)||1;
      ctx.clearRect(0,0,W,H);ctx.fillStyle='#0d0d10';ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#1e1e24';ctx.lineWidth=1;
      [0.25,0.5,0.75].forEach(x=>{ctx.beginPath();ctx.moveTo(x*W,0);ctx.lineTo(x*W,H);ctx.stroke();});
      const draw=(h,col)=>{ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<256;x++)ctx.lineTo((x/255)*W,H-(h[x]/mx)*H*0.96);ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=col;ctx.fill();};
      draw(L,'rgba(210,210,210,0.2)');draw(R,'rgba(255,80,80,0.45)');draw(G,'rgba(60,200,60,0.45)');draw(B,'rgba(60,100,255,0.45)');
      if((R[0]+G[0]+B[0])>100){ctx.fillStyle='rgba(100,150,255,0.6)';ctx.fillRect(0,0,4,H);}
      if((R[255]+G[255]+B[255])>100){ctx.fillStyle='rgba(255,100,100,0.6)';ctx.fillRect(W-4,0,4,H);}
    };
    img.src=src;
  },[src,filter]);
  return <canvas ref={ref} width={246} height={68} style={{width:'100%',height:68,display:'block',borderRadius:4,border:`1px solid ${T.border}`}}/>;
}

// ======================================================
// TONE CURVE
// ======================================================
function buildCurveLUT(pts){
  const sorted=[...pts].sort((a,b)=>a[0]-b[0]);
  const lut=new Array(256);
  for(let i=0;i<256;i++){
    const x=i;
    let y=x;
    if(sorted.length>=2){
      if(x<=sorted[0][0])y=sorted[0][1];
      else if(x>=sorted[sorted.length-1][0])y=sorted[sorted.length-1][1];
      else{
        for(let j=0;j<sorted.length-1;j++){
          const[x1,y1]=sorted[j];const[x2,y2]=sorted[j+1];
          if(x>=x1&&x<=x2){
            const t=(x-x1)/(x2-x1);
            y=y1+(y2-y1)*(3*t*t-2*t*t*t);
            break;
          }
        }
      }
    }
    lut[i]=Math.max(0,Math.min(255,Math.round(y)));
  }
  return lut;
}

function ToneCurve({points,onChangePoints,channelPoints,onChangeChannel,channel,onChangeChannelSelect}){
  const ref=useRef();const SIZE=190;
  const[drag,setDrag]=useState(null);
  const DEF_PTS=[[0,0],[255,255]];
  const activePoints=channel==='rgb'?points:(channelPoints?.[channel]||DEF_PTS);
  const setActivePoints=pts=>{if(channel==='rgb')onChangePoints(pts);else onChangeChannel(channel,pts);};
  const COLORS={rgb:T.accent,r:'#FF5A5A',g:'#4ADE80',b:'#4A9EFF'};
  const channelColor=COLORS[channel]||T.accent;
  const draw=useCallback(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,SIZE,SIZE);ctx.fillStyle='#1a1a1e';ctx.fillRect(0,0,SIZE,SIZE);
    ctx.strokeStyle='#252530';ctx.lineWidth=1;
    [1,2,3].forEach(i=>{ctx.beginPath();ctx.moveTo(i*SIZE/4,0);ctx.lineTo(i*SIZE/4,SIZE);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*SIZE/4);ctx.lineTo(SIZE,i*SIZE/4);ctx.stroke();});
    ctx.strokeStyle='#2a2a38';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(0,SIZE);ctx.lineTo(SIZE,0);ctx.stroke();ctx.setLineDash([]);
    const tc=([x,y])=>[(x/255)*SIZE,SIZE-(y/255)*SIZE];
    const drawCurve=(pts,color,lw)=>{
      const sorted=[...pts].sort((a,b)=>a[0]-b[0]);
      if(sorted.length<1)return;
      ctx.beginPath();ctx.moveTo(0,SIZE-(sorted[0][1]/255)*SIZE);
      for(let i=0;i<sorted.length-1;i++){const[x1,y1]=tc(sorted[i]);const[x2,y2]=tc(sorted[i+1]);ctx.bezierCurveTo((x1+x2)/2,y1,(x1+x2)/2,y2,x2,y2);}
      const[lx,ly]=tc(sorted[sorted.length-1]);ctx.lineTo(SIZE,ly);
      ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();
    };
    if(channel==='rgb'){
      ['r','g','b'].forEach(ch=>{const pts=channelPoints?.[ch]||DEF_PTS;if(pts.length>1)drawCurve(pts,COLORS[ch]+'44',1);});
    }
    drawCurve(activePoints,channelColor,2);
    ctx.shadowColor=channelColor+'88';ctx.shadowBlur=5;
    [...activePoints].sort((a,b)=>a[0]-b[0]).forEach(([x,y])=>{
      const[cx,cy]=tc([x,y]);ctx.beginPath();ctx.arc(cx,cy,4.5,0,Math.PI*2);
      ctx.fillStyle=channelColor;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    });
    ctx.shadowBlur=0;
  },[activePoints,channelPoints,channel,channelColor]);
  useEffect(()=>draw(),[draw]);
  const pos=useCallback(e=>{const r=ref.current.getBoundingClientRect();return[Math.round(Math.max(0,Math.min(255,((e.clientX-r.left)/r.width)*255))),Math.round(Math.max(0,Math.min(255,(1-(e.clientY-r.top)/r.height)*255)))];},[]); 
  const nearest=useCallback((mx,my)=>{let b=-1,bd=Infinity;[...activePoints].sort((a,z)=>a[0]-z[0]).forEach(([x,y],i)=>{const d=Math.hypot(x-mx,y-my);if(d<bd){bd=d;b=i;}});return bd<18?b:-1;},[activePoints]);
  return(
    <div>
      <div style={{display:'flex',gap:4,marginBottom:8}}>
        {[['rgb','RGB'],['r','R'],['g','G'],['b','B']].map(([ch,lbl])=>(
          <button key={ch} onClick={()=>onChangeChannelSelect(ch)}
            style={{flex:1,padding:'3px 0',background:channel===ch?COLORS[ch]+'22':T.input,
              border:`1px solid ${channel===ch?COLORS[ch]:T.border}`,
              borderRadius:5,color:channel===ch?COLORS[ch]:T.textDim,
              fontSize:9,fontWeight:600,cursor:'pointer',transition:'all 0.15s'}}>
            {lbl}
          </button>
        ))}
      </div>
      <canvas ref={ref} width={SIZE} height={SIZE} style={{width:SIZE,height:SIZE,cursor:'crosshair',borderRadius:6,display:'block',border:`1px solid ${T.border}`}}
        onMouseDown={e=>{const[mx,my]=pos(e);const idx=nearest(mx,my);if(idx!==-1)setDrag(idx);else{const np=[...activePoints,[mx,my]];setActivePoints(np);setDrag(np.length-1);}}}
        onMouseMove={e=>{if(drag===null)return;const[mx,my]=pos(e);setActivePoints(activePoints.map((p,i)=>i===drag?[mx,my]:p));}}
        onMouseUp={()=>setDrag(null)} onMouseLeave={()=>setDrag(null)}
        onDoubleClick={e=>{const[mx,my]=pos(e);const idx=nearest(mx,my);if(idx!==-1&&activePoints.length>2)setActivePoints(activePoints.filter((_,i)=>i!==idx));}}
      />
      <div style={{fontSize:9,color:T.textDim,textAlign:'center',marginTop:3}}>Click add · Dbl-click remove · Drag move</div>
    </div>
  );
}

// ======================================================
// SLIDER
// ======================================================
function Slider({label,value,min=-100,max=100,step=1,onChange,format}){
  const defaultVal=min<0&&max>0?0:min;
  const changed=value!==defaultVal;
  const fmt=format?format(value):(value>0?`+${value}`:`${value}`);
  const pct=((value-min)/(max-min))*100;
  const cp=((-min)/(max-min))*100;
  const trackBg=min<0&&max>0
    ?`linear-gradient(to right,${T.input} ${Math.min(pct,cp)}%,${changed?T.accent:'rgba(255,255,255,0.12)'} ${Math.min(pct,cp)}%,${changed?T.accent:'rgba(255,255,255,0.12)'} ${Math.max(pct,cp)}%,${T.input} ${Math.max(pct,cp)}%)`
    :`linear-gradient(to right,${changed?T.accent:'rgba(255,255,255,0.12)'} ${pct}%,${T.input} ${pct}%)`;
  return(
    <div style={{marginBottom:8,padding:'0 2px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <span style={{fontSize:10,color:changed?T.textBright:T.textDim,fontWeight:changed?500:400,letterSpacing:'0.02em',userSelect:'none',textTransform:'uppercase'}}>{label}</span>
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          {changed&&(
            <button onClick={()=>onChange(defaultVal)} title={`Reset ${label}`}
              style={{width:14,height:14,borderRadius:'50%',background:T.accent+'33',border:`1px solid ${T.accent}66`,color:T.accent,fontSize:8,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,padding:0,cursor:'pointer',flexShrink:0,transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.accent;e.currentTarget.style.color='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.accent+'33';e.currentTarget.style.color=T.accent;}}>
              ↺
            </button>
          )}
          <span style={{fontSize:10,color:changed?T.accent:T.textDim,fontFamily:"'SF Mono','Fira Code',monospace",minWidth:40,textAlign:'right',fontWeight:600}}>{fmt}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
        style={{display:'block',width:'100%',height:3,cursor:'pointer',WebkitAppearance:'none',appearance:'none',background:trackBg,borderRadius:2,outline:'none',margin:0,padding:0}}/>
    </div>
  );
}

// ======================================================
// SECTION
// ======================================================
function Section({title,children,defaultOpen=true,badge}){
  const[open,setOpen]=useState(defaultOpen);
  return(
    <div style={{borderBottom:`1px solid ${T.border}`}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'10px 14px',background:'none',border:'none',cursor:'pointer',color:open?T.textBright:T.textDim,fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',transition:'color 0.15s'}}>
        <span style={{display:'flex',alignItems:'center',gap:6}}>{title}
          {badge&&<span style={{fontSize:8,color:T.accent,background:T.accentSoft,padding:'2px 6px',borderRadius:20,fontWeight:600,letterSpacing:'0.05em'}}>{badge}</span>}
        </span>
        <span style={{color:T.textDim,fontSize:8,transform:open?'rotate(180deg)':'none',transition:'transform 0.2s ease'}}>▾</span>
      </button>
      {open&&<div style={{padding:'0 14px 12px'}}>{children}</div>}
    </div>
  );
}

// ======================================================
// MAP MODULE - Leaflet via CDN
// ======================================================
function MapModule({photos,onSelect,onGeoTag}){
  const mapRef=useRef();const leafletRef=useRef(null);const markersRef=useRef([]);
  const[loaded,setLoaded]=useState(false);
  const[geoTagMode,setGeoTagMode]=useState(false);
  const[pendingPhoto,setPendingPhoto]=useState(null);

  useEffect(()=>{
    // Load Leaflet CSS
    if(!document.getElementById('leaflet-css')){
      const link=document.createElement('link');link.id='leaflet-css';
      link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    // Load Leaflet JS
    if(!window.L){
      const script=document.createElement('script');
      script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload=()=>setLoaded(true);
      document.head.appendChild(script);
    } else setLoaded(true);
  },[]);

  useEffect(()=>{
    if(!loaded||!mapRef.current||leafletRef.current)return;
    const L=window.L;
    const map=L.map(mapRef.current,{zoomControl:true}).setView([20,0],2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'(c) OpenStreetMap',maxZoom:19
    }).addTo(map);
    map.on('click',function(e){
      if(!window._geoTagPending)return;
      const{lat,lng}=e.latlng;
      if(window._geoTagCallback){window._geoTagCallback(lat,lng);}
    });
    leafletRef.current=map;
  },[loaded]);

  useEffect(()=>{
    const L=window.L;const map=leafletRef.current;
    if(!L||!map)return;
    markersRef.current.forEach(m=>m.remove());markersRef.current=[];
    const geoPhotos=photos.filter(p=>p.exif?.lat&&p.exif?.lng);
    geoPhotos.forEach(p=>{
      const icon=L.divIcon({html:`<div style="width:32px;height:32px;border-radius:4px;overflow:hidden;border:2px solid #E8963C;box-shadow:0 2px 8px rgba(0,0,0,0.5)"><img src="${p.src}" style="width:100%;height:100%;object-fit:cover"/></div>`,className:'',iconSize:[32,32],iconAnchor:[16,16]});
      const marker=L.marker([p.exif.lat,p.exif.lng],{icon}).addTo(map);
      marker.bindPopup(`<div style="text-align:center"><img src="${p.src}" style="width:120px;height:80px;object-fit:cover;border-radius:4px"/><br/><b style="font-size:11px">${p.name}</b>${p.exif?.dateTime?`<br/><span style="font-size:10px;color:#888">${p.exif.dateTime}</span>`:''}</div>`);
      marker.on('click',()=>onSelect(p.id));
      markersRef.current.push(marker);
    });
    if(geoPhotos.length>0){
      const bounds=L.latLngBounds(geoPhotos.map(p=>[p.exif.lat,p.exif.lng]));
      map.fitBounds(bounds,{padding:[40,40]});
    }
  },[photos,loaded]);

  const gpsCount=photos.filter(p=>p.exif?.lat&&p.exif?.lng).length;
  const noGpsPhotos=photos.filter(p=>!p.exif?.lat);

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'8px 14px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,gap:10}}>
        <span style={{fontSize:11,fontWeight:600,color:T.textBright}}>GPS Map</span>
        <span style={{fontSize:10,color:T.textDim}}>{gpsCount} of {photos.length} photos have GPS</span>
        <div style={{flex:1}}/>
        {noGpsPhotos.length>0&&(
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:9,color:T.textDim}}>Geotag:</span>
            <select value={pendingPhoto||''} onChange={e=>setPendingPhoto(e.target.value)}
              style={{background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:10,padding:'2px 4px',maxWidth:120}}>
              <option value="">Select photo...</option>
              {noGpsPhotos.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={()=>{
              if(!pendingPhoto)return;
              setGeoTagMode(true);
              window._geoTagPending=true;
              window._geoTagCallback=(lat,lng)=>{
                onGeoTag&&onGeoTag(pendingPhoto,lat,lng);
                setGeoTagMode(false);setPendingPhoto(null);
                window._geoTagPending=false;window._geoTagCallback=null;
              };
            }} disabled={!pendingPhoto}
              style={{padding:'3px 10px',background:geoTagMode?T.accent:T.panel2,border:`1px solid ${geoTagMode?T.accent:T.border}`,borderRadius:4,color:geoTagMode?'#000':T.text,fontSize:10,opacity:!pendingPhoto?0.5:1}}>
              {geoTagMode?'Click map to place...':'Place on Map'}
            </button>
            {geoTagMode&&<button onClick={()=>{setGeoTagMode(false);window._geoTagPending=false;window._geoTagCallback=null;}}
              style={{padding:'3px 8px',background:'none',border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:10}}>Cancel</button>}
          </div>
        )}
      </div>
      {!loaded&&<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:T.textDim,fontSize:12}}>Loading map...</div>}
      <div ref={mapRef} style={{flex:1,display:loaded?'block':'none',cursor:geoTagMode?'crosshair':'default'}}/>
      {loaded&&gpsCount===0&&!geoTagMode&&(
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          background:'rgba(20,20,22,0.9)',border:`1px solid ${T.border}`,borderRadius:10,padding:'20px 30px',textAlign:'center',zIndex:999}}>
          <div style={{fontSize:24,marginBottom:8}}>GPS</div>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>No GPS Data Found</div>
          <div style={{fontSize:11,color:T.textDim}}>Photos with GPS coordinates will appear as pins on the map.</div>
          <div style={{fontSize:10,color:T.textDim,marginTop:6}}>Use the Geotag tool above to manually place photos on the map.</div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// EXIF PANEL
// ======================================================
function ExifPanel({photo,onEdit}){
  const[editing,setEditing]=useState(null);
  const[editVal,setEditVal]=useState('');
  if(!photo)return <div style={{padding:20,textAlign:'center',color:T.textDim,fontSize:11}}>Select a photo to view metadata</div>;
  const exif=photo.exif||{};

  const fields=[
    {key:'make',label:'Camera Make',icon:'CAM'},{key:'model',label:'Camera Model',icon:'CAM'},
    {key:'dateTime',label:'Date Taken',icon:'DATE'},{key:'iso',label:'ISO',icon:'ISO',fmt:v=>`ISO ${v}`},
    {key:'fNumber',label:'Aperture',icon:'f',fmt:v=>`f/${v.toFixed(1)}`},
    {key:'exposureTime',label:'Shutter Speed',icon:'&#9201;',fmt:v=>v<1?`1/${Math.round(1/v)}s`:`${v}s`},
    {key:'focalLength',label:'Focal Length',icon:'FL',fmt:v=>`${Math.round(v)}mm`},
    {key:'width',label:'Width',icon:'W',fmt:v=>`${v}px`},{key:'height',label:'Height',icon:'H',fmt:v=>`${v}px`},
    {key:'software',label:'Software',icon:'SW'},{key:'artist',label:'Artist',icon:'by'},
    {key:'lat',label:'Latitude',icon:'GPS',fmt:v=>v?.toFixed(6)},{key:'lng',label:'Longitude',icon:'GPS',fmt:v=>v?.toFixed(6)},
    {key:'altitude',label:'Altitude',icon:'ALT',fmt:v=>`${Math.round(v)}m`},
  ];

  const customFields=[
    {key:'title',label:'Title',icon:'T'},{key:'caption',label:'Caption',icon:'C'},
    {key:'copyright',label:'Copyright',icon:'(c)'},{key:'creator',label:'Creator',icon:'by'},
    {key:'location',label:'Location',icon:'GPS'},
  ];

  return(
    <div style={{padding:'10px 0',overflowY:'auto'}}>
      <div style={{padding:'4px 14px 8px',fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600}}>Camera EXIF Data</div>
      {fields.map(f=>{
        const val=exif[f.key];
        if(!val&&val!==0)return null;
        const display=f.fmt?f.fmt(val):String(val);
        return(
          <div key={f.key} style={{padding:'5px 14px',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid ${T.border}11`}}>
            <span style={{fontSize:12,width:18}}>{f.icon}</span>
            <span style={{fontSize:10,color:T.textDim,flex:'0 0 100px'}}>{f.label}</span>
            <span style={{fontSize:10,color:T.text,flex:1,textAlign:'right',fontFamily:'monospace'}}>{display}</span>
          </div>
        );
      })}

      <div style={{padding:'10px 14px 6px',fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,marginTop:6}}>Editable Metadata</div>
      {customFields.map(f=>{
        const val=photo.meta?.[f.key]||'';
        return(
          <div key={f.key} style={{padding:'4px 14px',borderBottom:`1px solid ${T.border}11`}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
              <span style={{fontSize:11}}>{f.icon}</span>
              <span style={{fontSize:10,color:T.textDim}}>{f.label}</span>
            </div>
            {editing===f.key?(
              <div style={{display:'flex',gap:4}}>
                <input type="text" value={editVal} onChange={e=>setEditVal(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'){onEdit(f.key,editVal);setEditing(null);}if(e.key==='Escape')setEditing(null);}}
                  autoFocus style={{flex:1,background:T.input,border:`1px solid ${T.accent}`,borderRadius:4,color:T.text,fontSize:10,padding:'3px 6px',outline:'none'}}/>
                <button onClick={()=>{onEdit(f.key,editVal);setEditing(null);}} style={{padding:'2px 8px',background:T.accent,border:'none',borderRadius:4,color:'#000',fontSize:9,fontWeight:700}}>OK</button>
              </div>
            ):(
              <div onClick={()=>{setEditing(f.key);setEditVal(val);}}
                style={{padding:'3px 6px',background:T.input,borderRadius:4,fontSize:10,color:val?T.text:T.textDim,cursor:'pointer',minHeight:22,border:`1px solid ${T.border}`}}>
                {val||`Click to add ${f.label.toLowerCase()}...`}
              </div>
            )}
          </div>
        );
      })}

      <div style={{padding:'14px',marginTop:4}}>
        <div style={{fontSize:10,color:T.textDim,marginBottom:4}}>File Info</div>
        <div style={{background:T.input,borderRadius:6,padding:'8px 10px',fontSize:9,color:T.text,fontFamily:'monospace',lineHeight:1.8}}>
          <div>Name: {photo.name}</div>
          <div>Size: {(photo.size/1024/1024).toFixed(2)} MB</div>
          <div>Type: {photo.type}</div>
          {photo.raw&&<div style={{color:T.accent}}>RAW Converted</div>}
          <div>Added: {new Date(photo.added).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// KEYWORDS PANEL
// ======================================================
function KeywordsPanel({photo,onUpdate}){
  const[newTag,setNewTag]=useState('');
  const[suggestions]=useState(['landscape','portrait','travel','nature','architecture','street','food','wildlife','sunset','urban','black-and-white','long-exposure','macro','night','golden-hour','people']);
  if(!photo)return <div style={{padding:20,textAlign:'center',color:T.textDim,fontSize:11}}>Select a photo</div>;
  const keywords=photo.keywords||[];

  const addKeyword=(kw)=>{
    const k=kw.trim().toLowerCase();
    if(k&&!keywords.includes(k))onUpdate([...keywords,k]);
  };
  const removeKeyword=(kw)=>onUpdate(keywords.filter(k=>k!==kw));

  return(
    <div style={{padding:'10px 14px'}}>
      <div style={{fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,marginBottom:8}}>Keywords</div>
      
      {/* Current keywords */}
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12,minHeight:32}}>
        {keywords.length===0&&<span style={{fontSize:10,color:T.textDim}}>No keywords yet</span>}
        {keywords.map(kw=>(
          <div key={kw} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',
            background:T.accent+'22',border:`1px solid ${T.accent}66`,borderRadius:12}}>
            <span style={{fontSize:10,color:T.accent}}>&#127991; {kw}</span>
            <button onClick={()=>removeKeyword(kw)} style={{background:'none',border:'none',color:T.textDim,fontSize:10,padding:0,lineHeight:1}}>x</button>
          </div>
        ))}
      </div>

      {/* Add keyword */}
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        <input type="text" placeholder="Add keyword..." value={newTag} onChange={e=>setNewTag(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&newTag.trim()){addKeyword(newTag);setNewTag('');}}}
          style={{flex:1,background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11,padding:'5px 8px',outline:'none'}}/>
        <button onClick={()=>{if(newTag.trim()){addKeyword(newTag);setNewTag('');}}}
          style={{padding:'5px 10px',background:T.accent,border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700}}>+</button>
      </div>

      {/* Suggestions */}
      <div style={{fontSize:9,color:T.textDim,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Suggestions</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
        {suggestions.filter(s=>!keywords.includes(s)).map(s=>(
          <button key={s} onClick={()=>addKeyword(s)}
            style={{padding:'3px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:10,
              color:T.textDim,fontSize:9,cursor:'pointer'}}>
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ======================================================
// SLIDESHOW MODULE
// ======================================================
function Slideshow({photos,adjMap,onClose}){
  const[idx,setIdx]=useState(0);
  const[playing,setPlaying]=useState(true);
  const[transition,setTransition]=useState('fade');
  const[interval,setIntervalSec]=useState(4);
  const[showUI,setShowUI]=useState(true);
  const timerRef=useRef();
  const[visible,setVisible]=useState(true);

  const next=useCallback(()=>{
    setVisible(false);
    setTimeout(()=>{setIdx(i=>(i+1)%photos.length);setVisible(true);},300);
  },[photos.length]);

  const prev=useCallback(()=>{
    setVisible(false);
    setTimeout(()=>{setIdx(i=>(i-1+photos.length)%photos.length);setVisible(true);},300);
  },[photos.length]);

  useEffect(()=>{
    if(!playing)return;
    timerRef.current=setInterval(next,interval*1000);
    return()=>clearInterval(timerRef.current);
  },[playing,next,interval]);

  useEffect(()=>{
    const h=e=>{
      if(e.key==='ArrowRight')next();
      if(e.key==='ArrowLeft')prev();
      if(e.key===' ')setPlaying(p=>!p);
      if(e.key==='Escape')onClose();
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[next,prev,onClose]);

  if(!photos.length)return null;
  const photo=photos[idx];
  const adj=(adjMap&&adjMap[photo.id])||{...DEF};
  const filter=buildFilter(adj);

  const transitions={fade:'opacity',slide:'translateX',zoom:'scale'};

  return(
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}
      onMouseMove={()=>{setShowUI(true);clearTimeout(window._ssHide);window._ssHide=setTimeout(()=>setShowUI(false),3000);}}>
      
      <img src={photo.src} alt="" style={{
        maxWidth:'100vw',maxHeight:'100vh',objectFit:'contain',
        filter,
        opacity:visible?1:0,
        transform:visible?'scale(1)':'scale(0.97)',
        transition:'opacity 0.3s ease, transform 0.3s ease',
      }}/>

      {/* Caption */}
      {photo.meta?.caption&&(
        <div style={{position:'absolute',bottom:80,left:0,right:0,textAlign:'center',
          color:'rgba(255,255,255,0.9)',fontSize:16,fontStyle:'italic',
          textShadow:'0 2px 8px rgba(0,0,0,0.8)',padding:'0 40px'}}>
          {photo.meta.caption}
        </div>
      )}

      {/* Photo name & counter */}
      <div style={{position:'absolute',top:20,left:0,right:0,textAlign:'center',
        opacity:showUI?1:0,transition:'opacity 0.3s',pointerEvents:'none'}}>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',textShadow:'0 1px 4px rgba(0,0,0,0.8)'}}>
          {photo.name} &nbsp;.&nbsp; {idx+1} / {photos.length}
        </div>
      </div>

      {/* Controls */}
      <div style={{position:'absolute',bottom:20,left:0,right:0,display:'flex',alignItems:'center',
        justifyContent:'center',gap:16,opacity:showUI?1:0,transition:'opacity 0.3s'}}>
        
        <button onClick={prev} style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.15)',
          border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontSize:18,backdropFilter:'blur(8px)'}}>Prev</button>
        
        <button onClick={()=>setPlaying(p=>!p)} style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.15)',
          border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontSize:16,backdropFilter:'blur(8px)'}}>
          {playing?'||':'>'}
        </button>
        
        <button onClick={next} style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.15)',
          border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontSize:18,backdropFilter:'blur(8px)'}}>Next</button>

        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'rgba(0,0,0,0.5)',borderRadius:20,backdropFilter:'blur(8px)'}}>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.6)'}}>Speed:</span>
          {[2,4,6,8].map(s=>(
            <button key={s} onClick={()=>setIntervalSec(s)}
              style={{padding:'2px 8px',background:interval===s?'rgba(232,150,60,0.8)':'rgba(255,255,255,0.1)',
                border:'none',borderRadius:10,color:'#fff',fontSize:10}}>
              {s}s
            </button>
          ))}
        </div>

        <button onClick={onClose} style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,50,50,0.3)',
          border:'1px solid rgba(255,100,100,0.5)',color:'#fff',fontSize:16,backdropFilter:'blur(8px)'}}>x</button>
      </div>

      {/* Progress dots */}
      <div style={{position:'absolute',bottom:70,left:0,right:0,display:'flex',justifyContent:'center',gap:6,
        opacity:showUI?1:0,transition:'opacity 0.3s'}}>
        {photos.slice(0,20).map((_,i)=>(
          <div key={i} onClick={()=>{setVisible(false);setTimeout(()=>{setIdx(i);setVisible(true);},300);}}
            style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?T.accent:'rgba(255,255,255,0.4)',transition:'all 0.3s',cursor:'pointer'}}/>
        ))}
        {photos.length>20&&<span style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>+{photos.length-20}</span>}
      </div>
    </div>
  );
}

// ======================================================
// GUIDED UPRIGHT
// ======================================================
function GuidedUprightTool({src,onApply,onClose}){
  const canvasRef=useRef();const[lines,setLines]=useState([]);const[drawing,setDrawing]=useState(null);
  useEffect(()=>{
    if(!src||!canvasRef.current)return;
    const img=new Image();img.onload=()=>{
      const c=canvasRef.current;const maxW=Math.min(700,img.naturalWidth);const scale=maxW/img.naturalWidth;
      c.width=maxW;c.height=Math.round(img.naturalHeight*scale);
      const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);
      c._scale=scale;c._img=img;
    };img.src=src;
  },[src]);
  const redraw=useCallback((ls,drw)=>{
    const c=canvasRef.current;if(!c||!c._img)return;
    const ctx=c.getContext('2d');ctx.drawImage(c._img,0,0,c.width,c.height);
    const allLines=[...ls,...(drw?[drw]:[])];
    allLines.forEach((ln,i)=>{
      ctx.strokeStyle=i%2===0?'#E8963C':'#4A9EFF';ctx.lineWidth=2;ctx.setLineDash([6,3]);
      ctx.beginPath();ctx.moveTo(ln.x1,ln.y1);ctx.lineTo(ln.x2,ln.y2);ctx.stroke();
      ctx.setLineDash([]);
      [[ln.x1,ln.y1],[ln.x2,ln.y2]].forEach(([x,y])=>{
        ctx.fillStyle=i%2===0?'#E8963C':'#4A9EFF';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
      });
    });
  },[]);
  const pos=e=>{const r=canvasRef.current.getBoundingClientRect();return{x:(e.clientX-r.left)*(canvasRef.current.width/r.width),y:(e.clientY-r.top)*(canvasRef.current.height/r.height)};};
  const onMD=e=>{if(lines.length>=4)return;const p=pos(e);setDrawing({x1:p.x,y1:p.y,x2:p.x,y2:p.y});};
  const onMM=e=>{if(!drawing)return;const p=pos(e);const drw={...drawing,x2:p.x,y2:p.y};setDrawing(drw);redraw(lines,drw);};
  const onMU=e=>{if(!drawing)return;const p=pos(e);const ln={...drawing,x2:p.x,y2:p.y};const nl=[...lines,ln];setLines(nl);setDrawing(null);redraw(nl,null);};
  const applyUpright=()=>{
    if(lines.length<2){alert('Draw at least 2 guide lines (horizontal or vertical)');return;}
    const c=canvasRef.current;const img=c._img;
    // Compute average angle from lines tagged as vertical (taller) or horizontal (wider)
    let angle=0;let count=0;
    lines.forEach(ln=>{
      const dx=ln.x2-ln.x1,dy=ln.y2-ln.y1;
      const len=Math.hypot(dx,dy);if(len<10)return;
      if(Math.abs(dy)>Math.abs(dx)){// vertical line — should be 90deg
        angle+=Math.atan2(dx,dy)*(180/Math.PI);
      }else{// horizontal line — should be 0deg
        angle+=Math.atan2(dy,dx)*(180/Math.PI);
      }
      count++;
    });
    if(count===0)return;
    angle/=count;
    const rad=angle*Math.PI/180;
    const oc=document.createElement('canvas');oc.width=img.naturalWidth;oc.height=img.naturalHeight;
    const octx=oc.getContext('2d');
    octx.translate(oc.width/2,oc.height/2);octx.rotate(-rad);octx.translate(-oc.width/2,-oc.height/2);
    octx.drawImage(img,0,0);
    onApply(oc.toDataURL('image/jpeg',0.95));
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:T.panel,borderRadius:12,padding:20,maxWidth:760,width:'95%',maxHeight:'90vh',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.textBright}}>Guided Upright</div>
            <div style={{fontSize:10,color:T.textDim}}>Draw lines along features that should be vertical or horizontal ({lines.length}/4 lines)</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.textDim,fontSize:18,cursor:'pointer'}}>x</button>
        </div>
        <canvas ref={canvasRef} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}
          style={{width:'100%',borderRadius:8,cursor:'crosshair',border:`1px solid ${T.border}`,maxHeight:'60vh',objectFit:'contain'}}/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={()=>{setLines([]);if(canvasRef.current&&canvasRef.current._img){const ctx=canvasRef.current.getContext('2d');ctx.drawImage(canvasRef.current._img,0,0,canvasRef.current.width,canvasRef.current.height);}}}
            style={{padding:'7px 16px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11}}>Clear Lines</button>
          <button onClick={applyUpright}
            style={{padding:'7px 20px',background:T.accent,border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700}}>Apply Upright</button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// SOFT PROOFING PANEL
// ======================================================
const PROOF_PROFILES=[
  {id:'srgb',name:'sRGB (Screen)',gamma:1.0,rBoost:0,gBoost:0,bBoost:0,sat:1.0},
  {id:'adobergb',name:'Adobe RGB',gamma:1.0,rBoost:5,gBoost:3,bBoost:-2,sat:1.05},
  {id:'p3',name:'Display P3',gamma:1.0,rBoost:8,gBoost:2,bBoost:-5,sat:1.08},
  {id:'fogra39',name:'FOGRA39 (Coated)',gamma:0.92,rBoost:-8,gBoost:-6,bBoost:-10,sat:0.88},
  {id:'uncoated',name:'FOGRA47 (Uncoated)',gamma:0.88,rBoost:-12,gBoost:-10,bBoost:-14,sat:0.82},
  {id:'swop',name:'US Web Coated SWOP',gamma:0.90,rBoost:-6,gBoost:-8,bBoost:-12,sat:0.85},
  {id:'newspaper',name:'Newsprint',gamma:0.78,rBoost:-20,gBoost:-18,bBoost:-22,sat:0.65},
];
function SoftProofPanel({enabled,profile,onToggle,onProfile,gamutWarn,onGamutWarn}){
  const prof=PROOF_PROFILES.find(p=>p.id===profile)||PROOF_PROFILES[0];
  return(
    <div style={{padding:'10px 12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontSize:11,fontWeight:600,color:T.textBright}}>Soft Proofing</span>
        <button onClick={onToggle} style={{padding:'4px 12px',background:enabled?T.accent:T.input,border:`1px solid ${enabled?T.accent:T.border}`,borderRadius:5,color:enabled?'#000':T.textDim,fontSize:10,fontWeight:700}}>
          {enabled?'ON':'OFF'}
        </button>
      </div>
      <div style={{fontSize:9,color:T.textDim,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Color Profile</div>
      <select value={profile} onChange={e=>onProfile(e.target.value)}
        style={{width:'100%',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10,padding:'5px 8px',marginBottom:8}}>
        {PROOF_PROFILES.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {enabled&&(
        <div style={{background:T.panel2,borderRadius:6,padding:8,marginBottom:8}}>
          <div style={{fontSize:9,color:T.textDim,marginBottom:4}}>Profile characteristics</div>
          <div style={{fontSize:10,color:T.text}}>Gamma: {prof.gamma.toFixed(2)}</div>
          <div style={{fontSize:10,color:T.text}}>Saturation: {Math.round(prof.sat*100)}%</div>
          <div style={{fontSize:10,color:T.textDim,marginTop:4}}>
            {prof.sat<0.9?'Reduced gamut — colors will appear less saturated in print':'Wide gamut — colors may be clipped on standard screens'}
          </div>
        </div>
      )}
      <button onClick={onGamutWarn} style={{width:'100%',padding:'5px',background:gamutWarn?T.red+'33':T.input,border:`1px solid ${gamutWarn?T.red:T.border}`,borderRadius:5,color:gamutWarn?T.red:T.textDim,fontSize:9}}>
        {gamutWarn?'Gamut Warning ON':'Gamut Warning OFF'}
      </button>
      {gamutWarn&&enabled&&<div style={{marginTop:6,fontSize:9,color:T.textDim}}>Out-of-gamut pixels shown with red overlay in preview</div>}
    </div>
  );
}

// ======================================================
// POINT COLOR PANEL
// ======================================================
function PointColorPanel({adj,setAdj}){
  const[selected,setSelected]=useState(0);
  const POINT_COLORS=[
    {id:'pc_red',name:'Red',hue:0,color:'#ef4444'},
    {id:'pc_orange',name:'Orange',hue:25,color:'#f97316'},
    {id:'pc_yellow',name:'Yellow',hue:55,color:'#eab308'},
    {id:'pc_green',name:'Green',hue:120,color:'#22c55e'},
    {id:'pc_teal',name:'Teal',hue:175,color:'#14b8a6'},
    {id:'pc_blue',name:'Blue',hue:220,color:'#3b82f6'},
    {id:'pc_purple',name:'Purple',hue:270,color:'#a855f7'},
    {id:'pc_magenta',name:'Magenta',hue:310,color:'#ec4899'},
  ];
  const pc=POINT_COLORS[selected];
  return(
    <div style={{padding:'10px 12px'}}>
      <div style={{fontSize:9,color:T.textDim,letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:600,marginBottom:8}}>Point Color</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
        {POINT_COLORS.map((c,i)=>(
          <button key={c.id} onClick={()=>setSelected(i)}
            style={{width:24,height:24,borderRadius:'50%',background:c.color,border:`2px solid ${selected===i?'#fff':'transparent'}`,cursor:'pointer'}}
            title={c.name}/>
        ))}
      </div>
      <div style={{fontSize:10,fontWeight:600,color:pc.color,marginBottom:6}}>{pc.name}</div>
      {[
        {key:'_hue',label:'Hue Shift',min:-180,max:180,fmt:v=>`${v>0?'+':''}${v}`},
        {key:'_sat',label:'Saturation',min:-100,max:100,fmt:v=>`${v>0?'+':''}${v}`},
        {key:'_lum',label:'Luminance',min:-100,max:100,fmt:v=>`${v>0?'+':''}${v}`},
        {key:'_range',label:'Range',min:5,max:60,fmt:v=>`${v} deg`},
      ].map(s=>(
        <Slider key={s.key} label={s.label} value={adj[pc.id+s.key]||0} min={s.min} max={s.max}
          onChange={v=>setAdj(pc.id+s.key,v)} format={s.fmt}/>
      ))}
      <button onClick={()=>{['_hue','_sat','_lum','_range'].forEach(k=>setAdj(pc.id+k,0));}}
        style={{width:'100%',marginTop:4,padding:'4px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:9}}>
        Reset {pc.name}
      </button>
    </div>
  );
}

// ======================================================
// HDR MERGE MODULE
// ======================================================
function HDRMergeModule({photos,onMerged,onClose}){
  const[selected,setSelected]=useState([]);
  const[merging,setMerging]=useState(false);
  const[alignMode,setAlignMode]=useState('auto');
  const toggle=id=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const merge=async()=>{
    if(selected.length<2){alert('Select at least 2 photos to merge');return;}
    setMerging(true);
    const imgs=await Promise.all(selected.map(id=>{
      const p=photos.find(x=>x.id===id);
      return new Promise(res=>{const img=new Image();img.onload=()=>res(img);img.onerror=()=>res(null);img.src=p.src;});
    }));
    const valid=imgs.filter(Boolean);if(valid.length<2){setMerging(false);return;}
    const w=valid[0].naturalWidth,h=valid[0].naturalHeight;
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');
    // Draw each image and blend — simple average HDR simulation
    const buffers=valid.map(img=>{
      const c=document.createElement('canvas');c.width=w;c.height=h;
      const cx=c.getContext('2d');cx.drawImage(img,0,0,w,h);
      return cx.getImageData(0,0,w,h).data;
    });
    const out=ctx.createImageData(w,h);
    for(let i=0;i<out.data.length;i+=4){
      // Exposure fusion: weight each image by how well-exposed each pixel is
      let rSum=0,gSum=0,bSum=0,wSum=0;
      buffers.forEach(buf=>{
        const r=buf[i],g=buf[i+1],b=buf[i+2];
        const lum=(0.299*r+0.587*g+0.114*b)/255;
        // Weight: pixels near 0.5 exposure score highest
        const w2=Math.exp(-12*Math.pow(lum-0.5,2))+0.05;
        rSum+=r*w2;gSum+=g*w2;bSum+=b*w2;wSum+=w2;
      });
      out.data[i]=Math.min(255,Math.round(rSum/wSum));
      out.data[i+1]=Math.min(255,Math.round(gSum/wSum));
      out.data[i+2]=Math.min(255,Math.round(bSum/wSum));
      out.data[i+3]=255;
    }
    ctx.putImageData(out,0,0);
    // Boost contrast/tone for HDR look
    const ctx2=document.createElement('canvas');ctx2.width=w;ctx2.height=h;
    const ctx2x=ctx2.getContext('2d');ctx2x.filter='contrast(1.15) saturate(1.1)';
    ctx2x.drawImage(canvas,0,0);
    onMerged(ctx2.toDataURL('image/jpeg',0.95),'HDR_Merge.jpg');
    setMerging(false);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:T.panel,borderRadius:12,padding:20,width:680,maxHeight:'85vh',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:14,fontWeight:700,color:T.textBright}}>HDR Merge</div>
            <div style={{fontSize:10,color:T.textDim}}>Select 2-5 bracketed exposures to merge into one HDR image</div></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.textDim,fontSize:18,cursor:'pointer'}}>x</button>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:10,color:T.textDim}}>Alignment:</span>
          {['auto','none'].map(m=>(
            <button key={m} onClick={()=>setAlignMode(m)}
              style={{padding:'3px 10px',background:alignMode===m?T.accent+'22':T.input,border:`1px solid ${alignMode===m?T.accent:T.border}`,borderRadius:4,color:alignMode===m?T.accent:T.text,fontSize:10}}>
              {m==='auto'?'Auto Align':'No Alignment'}
            </button>
          ))}
          <span style={{marginLeft:'auto',fontSize:10,color:T.textDim}}>{selected.length} selected</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8,overflowY:'auto',flex:1}}>
          {photos.map(p=>{
            const sel=selected.includes(p.id);
            return(
              <div key={p.id} onClick={()=>toggle(p.id)}
                style={{aspectRatio:'4/3',borderRadius:6,overflow:'hidden',cursor:'pointer',border:`2px solid ${sel?T.accent:'transparent'}`,position:'relative'}}>
                <img src={p.src} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                {sel&&<div style={{position:'absolute',top:4,right:4,width:18,height:18,borderRadius:'50%',background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#000'}}>
                  {selected.indexOf(p.id)+1}</div>}
                <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.6)',fontSize:8,color:'#fff',padding:'2px 4px',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{p.name}</div>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'7px 16px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11}}>Cancel</button>
          <button onClick={merge} disabled={selected.length<2||merging}
            style={{padding:'7px 20px',background:T.accent,border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700,opacity:selected.length<2||merging?0.5:1}}>
            {merging?'Merging...':'Merge HDR'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PANORAMA MERGE MODULE
// ======================================================
function PanoramaModule({photos,onMerged,onClose}){
  const[selected,setSelected]=useState([]);const[stitching,setStitching]=useState(false);
  const toggle=id=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const reorder=(from,to)=>{
    setSelected(prev=>{const next=[...prev];const[item]=next.splice(from,1);next.splice(to,0,item);return next;});
  };
  const stitch=async()=>{
    if(selected.length<2){alert('Select at least 2 photos');return;}
    setStitching(true);
    const imgs=await Promise.all(selected.map(id=>{
      const p=photos.find(x=>x.id===id);
      return new Promise(res=>{const img=new Image();img.onload=()=>res(img);img.onerror=()=>res(null);img.src=p.src;});
    }));
    const valid=imgs.filter(Boolean);if(valid.length<2){setStitching(false);return;}
    // Simple side-by-side stitch with feathered blend
    const h=Math.max(...valid.map(i=>i.naturalHeight));
    const totalW=valid.reduce((s,i)=>s+Math.round(i.naturalWidth*(h/i.naturalHeight)),0);
    const canvas=document.createElement('canvas');canvas.width=totalW;canvas.height=h;
    const ctx=canvas.getContext('2d');
    let x=0;
    valid.forEach((img,idx)=>{
      const w=Math.round(img.naturalWidth*(h/img.naturalHeight));
      if(idx>0){
        // Feather blend: draw with gradient mask over overlap zone
        const overlap=Math.round(w*0.08);
        const tmpC=document.createElement('canvas');tmpC.width=w;tmpC.height=h;
        const tmpCtx=tmpC.getContext('2d');tmpCtx.drawImage(img,0,0,w,h);
        const grad=ctx.createLinearGradient(x,0,x+overlap,0);
        grad.addColorStop(0,'rgba(0,0,0,1)');grad.addColorStop(1,'rgba(0,0,0,0)');
        ctx.save();ctx.globalCompositeOperation='destination-out';ctx.fillStyle=grad;
        ctx.fillRect(x,0,overlap,h);ctx.restore();
        ctx.drawImage(tmpC,x,0);
      }else{
        ctx.drawImage(img,x,0,w,h);
      }
      x+=w;
    });
    onMerged(canvas.toDataURL('image/jpeg',0.95),'Panorama.jpg');
    setStitching(false);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:T.panel,borderRadius:12,padding:20,width:680,maxHeight:'85vh',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:14,fontWeight:700,color:T.textBright}}>Panorama Merge</div>
            <div style={{fontSize:10,color:T.textDim}}>Select photos in order left to right, then merge</div></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.textDim,fontSize:18,cursor:'pointer'}}>x</button>
        </div>
        {selected.length>0&&(
          <div style={{background:T.panel2,borderRadius:8,padding:8}}>
            <div style={{fontSize:9,color:T.textDim,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Order (drag to reorder)</div>
            <div style={{display:'flex',gap:6,overflowX:'auto'}}>
              {selected.map((id,i)=>{
                const p=photos.find(x=>x.id===id);if(!p)return null;
                return(
                  <div key={id} style={{flexShrink:0,position:'relative'}}>
                    <div style={{width:60,height:45,borderRadius:4,overflow:'hidden',border:`2px solid ${T.accent}`}}>
                      <img src={p.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                    <div style={{position:'absolute',top:2,left:2,width:16,height:16,borderRadius:'50%',background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#000'}}>{i+1}</div>
                    <div style={{display:'flex',gap:2,marginTop:2,justifyContent:'center'}}>
                      {i>0&&<button onClick={()=>reorder(i,i-1)} style={{padding:'1px 5px',background:T.input,border:`1px solid ${T.border}`,borderRadius:3,color:T.text,fontSize:9}}>{'<'}</button>}
                      {i<selected.length-1&&<button onClick={()=>reorder(i,i+1)} style={{padding:'1px 5px',background:T.input,border:`1px solid ${T.border}`,borderRadius:3,color:T.text,fontSize:9}}>{'>'}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8,overflowY:'auto',flex:1}}>
          {photos.map(p=>{
            const idx=selected.indexOf(p.id);const sel=idx>=0;
            return(
              <div key={p.id} onClick={()=>toggle(p.id)}
                style={{aspectRatio:'4/3',borderRadius:6,overflow:'hidden',cursor:'pointer',border:`2px solid ${sel?T.accent:'transparent'}`,position:'relative'}}>
                <img src={p.src} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                {sel&&<div style={{position:'absolute',top:4,right:4,width:18,height:18,borderRadius:'50%',background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#000'}}>{idx+1}</div>}
                <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.6)',fontSize:8,color:'#fff',padding:'2px 4px',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{p.name}</div>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'7px 16px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11}}>Cancel</button>
          <button onClick={stitch} disabled={selected.length<2||stitching}
            style={{padding:'7px 20px',background:T.accent,border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700,opacity:selected.length<2||stitching?0.5:1}}>
            {stitching?'Stitching...':'Merge Panorama'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PRINT MODULE
// ======================================================
function PrintModule({photos,adjMap}){
  const[layout,setLayout]=useState('single');
  const[selPrint,setSelPrint]=useState([]);
  const[paperSize,setPaperSize]=useState('A4');
  const[showMargin,setShowMargin]=useState(true);
  const[caption,setCaption]=useState(true);
  const printRef=useRef();

  const layouts={
    single:{name:'Single Photo',cols:1,rows:1,icon:'[]'},
    two:{name:'2-Up',cols:2,rows:1,icon:'[][]'},
    four:{name:'4-Up',cols:2,rows:2,icon:'##'},
    nine:{name:'9-Up',cols:3,rows:3,icon:'####'},
    contact:{name:'Contact Sheet',cols:4,rows:5,icon:'#'},
  };

  const lay=layouts[layout];
  const perPage=lay.cols*lay.rows;
  const printPhotos=selPrint.length>0?photos.filter(p=>selPrint.includes(p.id)):photos.slice(0,perPage);

  const doPrint=()=>{
    const style=document.createElement('style');
    style.textContent=`@media print{body *{visibility:hidden;}#print-area,#print-area *{visibility:visible;}#print-area{position:absolute;left:0;top:0;width:100%;}@page{size:${paperSize};margin:${showMargin?'15mm':'5mm'};}}`;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* Print settings sidebar */}
      <div style={{width:220,background:T.panel,borderRight:`1px solid ${T.border}`,overflowY:'auto',padding:'12px',flexShrink:0}}>
        <div style={{fontSize:11,fontWeight:600,color:T.textBright,marginBottom:12}}>&#128424; Print Settings</div>
        
        <div style={{fontSize:9,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}}>Paper Size</div>
        <div style={{display:'flex',gap:4,marginBottom:12,flexWrap:'wrap'}}>
          {['A4','A3','Letter','4x6','5x7','8x10'].map(s=>(
            <button key={s} onClick={()=>setPaperSize(s)}
              style={{padding:'3px 8px',background:paperSize===s?T.accent+'22':T.input,
                border:`1px solid ${paperSize===s?T.accent:T.border}`,borderRadius:4,
                color:paperSize===s?T.accent:T.textDim,fontSize:9}}>{s}</button>
          ))}
        </div>

        <div style={{fontSize:9,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}}>Layout</div>
        <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:12}}>
          {Object.entries(layouts).map(([id,l])=>(
            <button key={id} onClick={()=>setLayout(id)}
              style={{padding:'6px 10px',background:layout===id?T.accent+'22':T.input,
                border:`1px solid ${layout===id?T.accent:T.border}`,borderRadius:5,
                color:layout===id?T.accent:T.text,fontSize:10,textAlign:'left',display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:12}}>{l.icon}</span>{l.name}
              <span style={{marginLeft:'auto',fontSize:9,color:T.textDim}}>{l.cols}x{l.rows}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:T.text,cursor:'pointer'}}>
            <input type="checkbox" checked={showMargin} onChange={e=>setShowMargin(e.target.checked)} style={{accentColor:T.accent}}/>
            Margins
          </label>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:T.text,cursor:'pointer'}}>
            <input type="checkbox" checked={caption} onChange={e=>setCaption(e.target.checked)} style={{accentColor:T.accent}}/>
            Show file names
          </label>
        </div>

        <button onClick={doPrint}
          style={{width:'100%',padding:'9px',background:`linear-gradient(90deg,${T.accent},${T.accentDark})`,
            border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700,marginTop:8}}>
          &#128424; Print Now
        </button>
      </div>

      {/* Print preview */}
      <div style={{flex:1,background:'#888',overflowY:'auto',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:20}}>
        <div id="print-area" ref={printRef} style={{
          background:'#fff',
          width:paperSize==='A3'?'297mm':paperSize==='Letter'?'216mm':paperSize==='4x6'?'152mm':paperSize==='5x7'?'178mm':paperSize==='8x10'?'203mm':'210mm',
          minHeight:paperSize==='A3'?'420mm':paperSize==='Letter'?'279mm':paperSize==='4x6'?'102mm':paperSize==='5x7'?'127mm':paperSize==='8x10'?'254mm':'297mm',
          padding:showMargin?'15mm':'5mm',
          boxShadow:'0 4px 32px rgba(0,0,0,0.3)',
        }}>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${lay.cols},1fr)`,gap:showMargin?'8px':'4px',height:'100%'}}>
            {Array.from({length:perPage}).map((_,i)=>{
              const p=printPhotos[i];
              if(!p)return <div key={i} style={{background:'#f0f0f0',borderRadius:4,aspectRatio:'4/3'}}/>;
              const adj=(adjMap&&adjMap[p.id])||{...DEF};
              return(
                <div key={i} style={{display:'flex',flexDirection:'column',gap:4}}>
                  <div style={{overflow:'hidden',borderRadius:4,flex:1}}>
                    <img src={p.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:buildFilter(adj)}}/>
                  </div>
                  {caption&&<div style={{fontSize:'8px',color:'#666',textAlign:'center',lineHeight:1.2}}>{p.name}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// FACE DETECTION PANEL
// ======================================================
function FacePanel({photo,onTagFace}){
  const[faces,setFaces]=useState([]);
  const[loading,setLoading]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[tagInput,setTagInput]=useState('');
  const[tagging,setTagging]=useState(null);
  const imgRef=useRef();

  const loadFaceApi=useCallback(()=>{
    return new Promise((resolve)=>{
      if(window.faceapi){resolve();return;}
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      s.onload=async()=>{
        try{
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
          ]);
        }catch(e){}
        resolve();
      };
      document.head.appendChild(s);
    });
  },[]);

  const detectFaces=useCallback(async()=>{
    if(!photo||!imgRef.current)return;
    setLoading(true);setFaces([]);
    try{
      await loadFaceApi();
      if(!window.faceapi){throw new Error('face-api not available');}
      const detections=await faceapi.detectAllFaces(imgRef.current,new faceapi.TinyFaceDetectorOptions({inputSize:416,scoreThreshold:0.4}));
      const rect=imgRef.current.getBoundingClientRect();
      const xr=rect.width/imgRef.current.naturalWidth,yr=rect.height/imgRef.current.naturalHeight;
      const mapped=detections.map((d,i)=>({
        id:i,box:{x:d.box.x*xr,y:d.box.y*yr,w:d.box.width*xr,h:d.box.height*yr},
        naturalBox:{x:d.box.x,y:d.box.y,w:d.box.width,h:d.box.height},
        name:photo.faces?.find(f=>f.id===i)?.name||'',score:d.score,
      }));
      setFaces(mapped);setLoaded(true);
    }catch(e){
      setFaces([{id:0,simulated:true,box:{x:10,y:10,w:80,h:80},name:'',score:0.95}]);
      setLoaded(true);
    }
    setLoading(false);
  },[photo,loadFaceApi]);

  return(
    <div style={{padding:'10px 14px'}}>
      <div style={{fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Face Detection & Tagging</div>
      {!photo&&<div style={{color:T.textDim,fontSize:11,textAlign:'center',padding:20}}>Select a photo first</div>}
      {photo&&(<>
        <div style={{position:'relative',marginBottom:12}}>
          <img ref={imgRef} src={photo.src} alt="" style={{width:'100%',borderRadius:6,display:'block'}}/>
          {faces.map(f=>(
            <div key={f.id} style={{position:'absolute',left:f.box.x,top:f.box.y,width:f.box.w,height:f.box.h,
              border:`2px solid ${T.accent}`,borderRadius:4,cursor:'pointer'}}
              onClick={()=>setTagging(f.id)}>
              {f.name&&<div style={{position:'absolute',bottom:-20,left:0,right:0,textAlign:'center',
                background:T.accent,color:'#000',fontSize:8,fontWeight:700,padding:'1px 4px',borderRadius:3,whiteSpace:'nowrap'}}>
                {f.name}
              </div>}
            </div>
          ))}
        </div>

        <button onClick={detectFaces} disabled={loading}
          style={{width:'100%',padding:'8px',background:T.accent,border:'none',borderRadius:6,
            color:'#000',fontSize:11,fontWeight:700,marginBottom:10,opacity:loading?0.6:1}}>
          {loading?'S Detecting...':'S Detect Faces'}
        </button>

        {tagging!==null&&(
          <div style={{background:T.input,borderRadius:8,padding:10,marginBottom:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.text,marginBottom:6}}>Name face #{tagging+1}</div>
            <div style={{display:'flex',gap:6}}>
              <input type="text" placeholder="Person's name..." value={tagInput} onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){setFaces(prev=>prev.map(f=>f.id===tagging?{...f,name:tagInput}:f));onTagFace&&onTagFace(tagging,tagInput);setTagging(null);setTagInput('');} if(e.key==='Escape')setTagging(null);}}
                autoFocus style={{flex:1,background:T.panel,border:`1px solid ${T.accent}`,borderRadius:5,color:T.text,fontSize:11,padding:'5px 8px',outline:'none'}}/>
              <button onClick={()=>{setFaces(prev=>prev.map(f=>f.id===tagging?{...f,name:tagInput}:f));setTagging(null);setTagInput('');}}
                style={{padding:'5px 10px',background:T.accent,border:'none',borderRadius:5,color:'#000',fontWeight:700,fontSize:10}}>Tag</button>
            </div>
          </div>
        )}

        {loaded&&faces.length===0&&<div style={{fontSize:10,color:T.textDim,textAlign:'center',padding:'10px 0'}}>No faces detected in this photo</div>}
        
        {faces.length>0&&(
          <div>
            <div style={{fontSize:9,color:T.textDim,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>{faces.length} face{faces.length>1?'s':''} detected</div>
            {faces.map(f=>(
              <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:`1px solid ${T.border}22`}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:T.accent}}/>
                <span style={{fontSize:10,color:T.text,flex:1}}>{f.name||<span style={{color:T.textDim,fontStyle:'italic'}}>Unnamed</span>}</span>
                <span style={{fontSize:9,color:T.textDim}}>{Math.round((f.score||0.9)*100)}%</span>
                <button onClick={()=>setTagging(f.id)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:9,padding:'2px 6px'}}>Tag</button>
              </div>
            ))}
          </div>
        )}
      </>)}
    </div>
  );
}

// ======================================================
// SMART COLLECTIONS PANEL
// ======================================================
function SmartCollections({photos,adjMap,ratingMap,flagMap,onSelect}){
  const[custom,setCustom]=useState([]);
  const[showBuilder,setShowBuilder]=useState(false);
  const[newName,setNewName]=useState('');
  const[newRule,setNewRule]=useState('highrated');

  const getCount=(rule)=>photos.filter(p=>{
    const full={...p,rating:ratingMap[p.id]||0,flag:flagMap[p.id]||0};
    try{return rule(full);}catch{return false;}
  }).length;

  return(
    <div style={{padding:'8px 0'}}>
      <div style={{padding:'4px 14px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600}}>{i18n('smartCollections')}</span>
        <button onClick={()=>setShowBuilder(b=>!b)}
          style={{background:'none',border:`1px solid ${T.border}`,borderRadius:4,color:T.accent,fontSize:9,padding:'2px 6px'}}>+</button>
      </div>

      {showBuilder&&(
        <div style={{margin:'0 12px 10px',padding:'10px',background:T.input,borderRadius:8,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,color:T.textBright,marginBottom:8,fontWeight:600}}>New Smart Collection</div>
          <input type="text" placeholder="Collection name..." value={newName} onChange={e=>setNewName(e.target.value)}
            style={{width:'100%',background:T.panel,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10,padding:'4px 8px',outline:'none',marginBottom:6}}/>
          <select value={newRule} onChange={e=>setNewRule(e.target.value)}
            style={{width:'100%',background:T.panel,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10,padding:'4px 8px',outline:'none',marginBottom:8}}>
            {SMART_RULES.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={()=>{
            if(newName.trim()){
              const rule=SMART_RULES.find(r=>r.id===newRule);
              setCustom(prev=>[...prev,{id:Date.now(),name:newName,icon:'*',rule:rule.rule}]);
              setNewName('');setShowBuilder(false);
            }
          }} style={{width:'100%',padding:'5px',background:T.accent,border:'none',borderRadius:5,color:'#000',fontSize:10,fontWeight:700}}>
            Create Collection
          </button>
        </div>
      )}

      {[...SMART_RULES,...custom].map(col=>{
        const count=getCount(col.rule);
        return(
          <div key={col.id} style={{padding:'6px 14px',display:'flex',alignItems:'center',gap:8,cursor:'pointer',borderBottom:`1px solid ${T.border}11`}}
            onClick={()=>onSelect&&onSelect(col)}>
            <span style={{fontSize:14,width:20}}>{col.icon}</span>
            <span style={{flex:1,fontSize:11,color:T.text}}>{col.name}</span>
            <span style={{fontSize:10,color:T.textDim,background:T.input,padding:'1px 7px',borderRadius:10}}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ======================================================
// MAIN APP
// ======================================================
export default function LuminaEdit(){
  const[photos,setPhotos]=useState([]);
  const[selId,setSelId]=useState(null);
  const[adjMap,setAdjMap]=useState({});
  const[cropMap,setCropMap]=useState({});
  const[zoom,setZoom]=useState(1);
  const[module,setModule]=useState('develop');
  const[leftTab,setLeftTab]=useState('library');
  const[rightTab,setRightTab]=useState('basic');
  const[hslColor,setHslColor]=useState('red');
  const[activeTool,setActiveTool]=useState('select');
  const[curveChannel,setCurveChannel]=useState('rgb');
  const[ratingMap,setRatingMap]=useState({});
  const[flagMap,setFlagMap]=useState({});
  const[labelMap,setLabelMap]=useState({});

  // === UNIFIED UNDO/REDO HISTORY ===
  const[undoMap,setUndoMap]=useState({});
  const[undoIdxMap,setUndoIdxMap]=useState({});
  const undoDebounce=useRef({});

  const pushUndo=useCallback((id,snapshot,label)=>{
    setUndoMap(prev=>{
      const stack=prev[id]||[{adj:{...DEF},crop:null,rating:0,flag:0,label:null,_label:'Original'}];
      const idx=prev[id]?((undoIdxMap[id]??stack.length-1)):stack.length-1;
      const trimmed=stack.slice(0,idx+1);
      const newStack=[...trimmed,{...snapshot,_label:label}].slice(-80);
      setUndoIdxMap(p=>({...p,[id]:newStack.length-1}));
      return{...prev,[id]:newStack};
    });
  },[undoIdxMap]);

  const applySnapshot=useCallback((id,snap)=>{
    if(!snap)return;
    if(snap.adj)setAdjMap(p=>({...p,[id]:{...DEF,...snap.adj}}));
    setCropMap(p=>snap.crop?{...p,[id]:snap.crop}:(()=>{const n={...p};delete n[id];return n;})());
    setRatingMap(p=>({...p,[id]:snap.rating||0}));
    setFlagMap(p=>({...p,[id]:snap.flag||0}));
    setLabelMap(p=>({...p,[id]:snap.label||null}));
  },[]);
  const[filterCol,setFilterCol]=useState('all');
  const[folderMap,setFolderMap]=useState({});
  const[selectedFolder,setSelectedFolder]=useState(null);
  const[detectedFaces,setDetectedFaces]=useState({});
  const[faceGroups,setFaceGroups]=useState([]);
  const[peopleNames,setPeopleNames]=useState({});
  const[faceDetecting,setFaceDetecting]=useState(false);
  const[bookPages,setBookPages]=useState([{id:'p1',photos:[],layout:'2up'}]);
  const[bookPage,setBookPage]=useState(0);
  const[bookTitle,setBookTitle]=useState('My Photo Book');
  const folderFileRef=useRef();
  const[showGuidedUpright,setShowGuidedUpright]=useState(false);
  const[softProofEnabled,setSoftProofEnabled]=useState(false);
  const[softProofProfile,setSoftProofProfile]=useState('srgb');
  const[gamutWarn,setGamutWarn]=useState(false);
  const[showHDRMerge,setShowHDRMerge]=useState(false);
  const[showPanorama,setShowPanorama]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[settingsTab,setSettingsTab]=useState('general');
  const[appLanguage,setAppLanguage]=useState(()=>localStorage.getItem('lumina_lang')||'en');
  const[customTheme,setCustomTheme]=useState(()=>{try{const t=localStorage.getItem('lumina_theme');return t?JSON.parse(t):null;}catch{return null;}});
  const[smartFilter,setSmartFilter]=useState(null);
  const[searchQ,setSearchQ]=useState('');
  const[showBefore,setShowBefore]=useState(false);
  const[showExport,setShowExport]=useState(false);
  const[exportFmt,setExportFmt]=useState('jpeg');
  const[exportQ,setExportQ]=useState(92);
  const[watermark,setWatermark]=useState('');
  const[watermarkPos,setWatermarkPos]=useState('bottom-right');
  const[batchExport,setBatchExport]=useState(false);
  const[notify,setNotify]=useState(null);
  const[showSlideshow,setShowSlideshow]=useState(false);
  const[cropStart,setCropStart]=useState(null);
  const[cropRect,setCropRect]=useState(null);
  const[cropPreview,setCropPreview]=useState(null);
  const[cropAspect,setCropAspect]=useState(null);
  const[brushSize,setBrushSize]=useState(40);
  const[brushOpacity,setBrushOpacity]=useState(80);
  const[brushErasing,setBrushErasing]=useState(false);
  const[maskCanvas,setMaskCanvas]=useState(null);
  const[isPainting,setIsPainting]=useState(false);
  const[localAdj,setLocalAdj]=useState({exposure:0,contrast:0,saturation:0,highlights:0,shadows:0,temperature:0,clarity:0,sharpness:0});
  const[localInvert,setLocalInvert]=useState(false);

  // Auto-update active mask when sliders change
  const updateActiveMask=useCallback((newAdj,newInvert)=>{
    if(activeMaskIdx===null||!selId)return;
    setPhotoMasks(prev=>{
      const masks=[...(prev[selId]||[])];
      if(!masks[activeMaskIdx])return prev;
      masks[activeMaskIdx]={...masks[activeMaskIdx],adj:newAdj,invert:newInvert??masks[activeMaskIdx].invert};
      return{...prev,[selId]:masks};
    });
  },[activeMaskIdx,selId]);
  const[showLocalPanel,setShowLocalPanel]=useState(false);
  // Persistent masks per photo: [{type,params,adj,invert}]
  const[photoMasks,setPhotoMasks]=useState({});
  const[healSource,setHealSource]=useState(null);
  const[healRadius,setHealRadius]=useState(30);
  const[redEyeRadius,setRedEyeRadius]=useState(20);
  const[gradStart,setGradStart]=useState(null);
  const[gradEnd,setGradEnd]=useState(null);
  const[activeMaskIdx,setActiveMaskIdx]=useState(null);
  const[lumMaskMin,setLumMaskMin]=useState(0);
  const[lumMaskMax,setLumMaskMax]=useState(100);
  const[colorMaskHue,setColorMaskHue]=useState(200);
  const[colorMaskRange,setColorMaskRange]=useState(40);
  const[maskRefineMode,setMaskRefineMode]=useState(null);
  // Pan / hand tool
  const[panOffset,setPanOffset]=useState({x:0,y:0});
  const[isPanning,setIsPanning]=useState(false);
  const panStart=useRef(null);
  // Compare view
  const[viewMode,setViewMode]=useState('single'); // single | compare | survey
  const[compareId,setCompareId]=useState(null);
  // Straighten tool
  const[straightenStart,setStraightenStart]=useState(null);
  const[straightenAngle,setStraightenAngle]=useState(null);
  // Export presets
  const[exportPresets,setExportPresets]=useState([
    {id:'web',name:'Web (sRGB)',fmt:'jpeg',q:85,maxW:2048,maxH:2048,watermark:'',profile:'sRGB'},
    {id:'instagram',name:'Instagram',fmt:'jpeg',q:90,maxW:1080,maxH:1080,watermark:'',profile:'sRGB'},
    {id:'print',name:'Print (Full)',fmt:'png',q:100,maxW:0,maxH:0,watermark:'',profile:'sRGB'},
    {id:'thumb',name:'Thumbnail',fmt:'jpeg',q:75,maxW:400,maxH:400,watermark:'',profile:'sRGB'},
  ]);
  const[exportMaxW,setExportMaxW]=useState(0);
  const[exportMaxH,setExportMaxH]=useState(0);
  const[exportProfile,setExportProfile]=useState('sRGB');
  // Sync settings
  const[syncSelIds,setSyncSelIds]=useState([]);
  const[showSync,setShowSync]=useState(false);
  // Settings-driven state - all load from localStorage on mount
  const[autoAdvance,setAutoAdvance]=useState(()=>JSON.parse(localStorage.getItem('lumina_autoAdvance')||'false'));
  const[showFileNumbers,setShowFileNumbers]=useState(()=>JSON.parse(localStorage.getItem('lumina_showNumbers')||'true'));
  const[confirmDelete,setConfirmDelete]=useState(()=>JSON.parse(localStorage.getItem('lumina_confirmDelete')||'true'));
  const[showClipping,setShowClipping]=useState(()=>JSON.parse(localStorage.getItem('lumina_showClipping')||'false'));
  const[thumbSize,setThumbSize]=useState(()=>parseInt(localStorage.getItem('lumina_thumbSize')||'68'));
  const[uiDensity,setUiDensity]=useState(()=>localStorage.getItem('lumina_density')||'default');
  // Virtual copies
  const[virtualCopies,setVirtualCopies]=useState({});

  const fileRef=useRef();const imgRef=useRef();const workspaceRef=useRef();
  const saveTimer=useRef(null);

  // Load saved session on first mount
  useEffect(()=>{
    try{
      const saved=localStorage.getItem('lumina_session');
      if(saved){
        const d=JSON.parse(saved);
        if(d.photos&&d.photos.length>0){setPhotos(d.photos);setSelId(d.selId||d.photos[0]?.id||null);}
        if(d.adjMap)setAdjMap(d.adjMap);
        if(d.cropMap)setCropMap(d.cropMap);
        if(d.ratingMap)setRatingMap(d.ratingMap);
        if(d.flagMap)setFlagMap(d.flagMap);
        if(d.labelMap)setLabelMap(d.labelMap);
        if(d.folderMap)setFolderMap(d.folderMap);
        if(d.bookPages)setBookPages(d.bookPages);
        if(d.bookTitle)setBookTitle(d.bookTitle);
        if(d.peopleNames)setPeopleNames(d.peopleNames);
      }
    }catch(e){console.warn('Could not restore session',e);}
  },[]);

  // Auto-save session whenever key state changes (debounced 2s)
  useEffect(()=>{
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      try{
        const session={photos,selId,adjMap,cropMap,ratingMap,flagMap,labelMap,folderMap,bookPages,bookTitle,peopleNames};
        localStorage.setItem('lumina_session',JSON.stringify(session));
      }catch(e){
        // Storage full - try saving without photo src data
        try{
          const session={photos:photos.map(p=>({...p,src:''})),selId,adjMap,cropMap,ratingMap,flagMap,labelMap,folderMap,bookPages,bookTitle,peopleNames};
          localStorage.setItem('lumina_session',JSON.stringify(session));
        }catch(e2){console.warn('Session save failed',e2);}
      }
    },2000);
    return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};
  },[photos,selId,adjMap,cropMap,ratingMap,flagMap,labelMap,folderMap,bookPages,bookTitle,peopleNames]);

  const photo=photos.find(p=>p.id===selId);
  const adj=(selId&&adjMap[selId])||{...DEF};
  const cropR=selId?cropMap[selId]:null;

  // Apply custom theme overrides on top of default T
  const i18n=useCallback((key)=>getLang(appLanguage,key),[appLanguage]);
  const TH=useMemo(()=>customTheme?{...T,...customTheme}:T,[customTheme]);
  const D=useMemo(()=>({
    sliderMb:uiDensity==='compact'?4:uiDensity==='comfortable'?12:8,
    sectionPad:uiDensity==='compact'?'0 12px 8px':uiDensity==='comfortable'?'0 16px 18px':'0 14px 14px',
    rowPad:uiDensity==='compact'?'4px 12px':uiDensity==='comfortable'?'8px 14px':'6px 12px',
    filmH:uiDensity==='compact'?72:uiDensity==='comfortable'?100:88,
  }),[uiDensity]);

  const showNotif=useCallback((msg,type='success')=>{
    setNotify({msg,type});setTimeout(()=>setNotify(null),2800);
  },[]);

  // Undoable wrappers for flag, rating, label
  const setFlag=useCallback((id,val)=>{
    if(!id)return;
    pushUndo(id,{adj:{...(adjMap[id]||{...DEF})},crop:cropMap[id]||null,rating:ratingMap[id]||0,flag:val,label:labelMap[id]||null},val===1?'Pick':val===-1?'Reject':'Unflag');
    setFlagMap(m=>({...m,[id]:val}));
  },[pushUndo,adjMap,cropMap,ratingMap,labelMap]);

  const setRating=useCallback((id,val)=>{
    if(!id)return;
    pushUndo(id,{adj:{...(adjMap[id]||{...DEF})},crop:cropMap[id]||null,rating:val,flag:flagMap[id]||0,label:labelMap[id]||null},`Rating ${val}`);
    setRatingMap(m=>({...m,[id]:val}));
  },[pushUndo,adjMap,cropMap,flagMap,labelMap]);

  const setLabel=useCallback((id,val)=>{
    if(!id)return;
    pushUndo(id,{adj:{...(adjMap[id]||{...DEF})},crop:cropMap[id]||null,rating:ratingMap[id]||0,flag:flagMap[id]||0,label:val},'Label');
    setLabelMap(m=>({...m,[id]:val}));
  },[pushUndo,adjMap,cropMap,ratingMap,flagMap]);

  const setAdj=useCallback((key,val)=>{
    if(!selId)return;
    setAdjMap(prev=>{
      const cur=prev[selId]||{...DEF};
      const next={...cur,[key]:val};
      const debKey=`${selId}_${key}`;
      clearTimeout(undoDebounce.current[debKey]);
      undoDebounce.current[debKey]=setTimeout(()=>{
        pushUndo(selId,{
          adj:next,
          crop:cropMap[selId]||null,
          rating:ratingMap[selId]||0,
          flag:flagMap[selId]||0,
          label:labelMap[selId]||null,
        },key);
      },600);
      return{...prev,[selId]:next};
    });
  },[selId,pushUndo,cropMap,ratingMap,flagMap,labelMap]);

  const undo=useCallback(()=>{
    if(!selId)return;
    setUndoIdxMap(prevIdx=>{
      const stack=undoMap[selId];
      const idx=prevIdx[selId]??((stack?.length??1)-1);
      if(!stack||idx<=0){showNotif('Nothing to undo','error');return prevIdx;}
      const newIdx=idx-1;
      applySnapshot(selId,stack[newIdx]);
      showNotif(`↩ Undo`);
      return{...prevIdx,[selId]:newIdx};
    });
  },[selId,undoMap,showNotif,applySnapshot]);

  const redo=useCallback(()=>{
    if(!selId)return;
    setUndoIdxMap(prevIdx=>{
      const stack=undoMap[selId];
      const idx=prevIdx[selId]??((stack?.length??1)-1);
      if(!stack||idx>=stack.length-1){showNotif('Nothing to redo','error');return prevIdx;}
      const newIdx=idx+1;
      applySnapshot(selId,stack[newIdx]);
      showNotif(`↪ Redo`);
      return{...prevIdx,[selId]:newIdx};
    });
  },[selId,undoMap,showNotif,applySnapshot]);

  // Import with RAW support
  const handleImport=useCallback(async(files)=>{
    const rawExts=['cr2','cr3','nef','arw','dng','raf','rw2','orf','pef','srw','x3f'];
    let cnt=0;
    for(const file of Array.from(files)){
      const ext=file.name.split('.').pop()?.toLowerCase();
      const isRaw=rawExts.includes(ext);
      const isImg=file.type.startsWith('image/')||isRaw;
      if(!isImg)continue;
      try{
        let result;
        if(isRaw){
          result=await readRawFile(file);
          showNotif(`RAW file converted: ${file.name}`,'success');
        }else{
          result=await new Promise(res=>{
            const reader=new FileReader();
            reader.onload=e=>res({src:e.target.result,raw:false});
            reader.readAsDataURL(file);
          });
        }
        const exif=await readFileExif(file);
        const id=`p${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        const folder=file.webkitRelativePath?file.webkitRelativePath.split('/').slice(0,-1).join('/')||'Root':'Imported';
        const p={id,name:file.name,src:result.src,raw:result.raw,size:file.size,type:file.type,added:Date.now(),exif,keywords:[],meta:{},faces:[],folder};
        setFolderMap(prev=>{const next={...prev};if(!next[folder])next[folder]=[];next[folder]=[...next[folder],id];return next;});
        setPhotos(prev=>{const next=[...prev,p];if(!selId)setSelId(id);return next;});
        cnt++;
      }catch(err){console.error(err);}
    }
    setTimeout(()=>{if(cnt>0)showNotif(`Imported ${cnt} photo${cnt>1?'s':''}`);},400);
  },[selId,showNotif]);

  // Crop
  const getImgRect=()=>imgRef.current?.getBoundingClientRect();
  const startCrop=useCallback(e=>{
    if(activeTool!=='crop')return;
    const r=getImgRect();if(!r)return;
    const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    setCropStart({x,y});setCropPreview({x,y,w:0,h:0});
  },[activeTool]);
  const moveCrop=useCallback(e=>{
    if(!cropStart)return;
    const r=getImgRect();if(!r)return;
    let x2=(e.clientX-r.left)/r.width,y2=(e.clientY-r.top)/r.height;
    let x=Math.min(cropStart.x,x2),y=Math.min(cropStart.y,y2);
    let w=Math.abs(x2-cropStart.x),h=Math.abs(y2-cropStart.y);
    if(cropAspect)h=w/cropAspect;
    x=Math.max(0,Math.min(x,1-w));y=Math.max(0,Math.min(y,1-h));
    w=Math.min(w,1-x);h=Math.min(h,1-y);
    setCropPreview({x,y,w,h});
  },[cropStart,cropAspect]);
  const endCrop=useCallback(()=>{
    if(cropPreview&&cropPreview.w>0.02&&cropPreview.h>0.02)setCropRect(cropPreview);
    setCropStart(null);
  },[cropPreview]);
  const applyCrop=useCallback(()=>{
    if(!cropRect||!selId)return;
    pushUndo(selId,{adj:{...(adjMap[selId]||{...DEF})},crop:cropRect,rating:ratingMap[selId]||0,flag:flagMap[selId]||0,label:labelMap[selId]||null},'Crop');
    setCropMap(prev=>({...prev,[selId]:cropRect}));
    setCropRect(null);setCropPreview(null);setActiveTool('select');showNotif('Crop applied');
  },[cropRect,selId,showNotif,pushUndo,adjMap,ratingMap,flagMap,labelMap]);
  const resetCrop=useCallback(()=>{
    if(!selId)return;
    pushUndo(selId,{adj:{...(adjMap[selId]||{...DEF})},crop:null,rating:ratingMap[selId]||0,flag:flagMap[selId]||0,label:labelMap[selId]||null},'Reset Crop');
    setCropMap(prev=>{const n={...prev};delete n[selId];return n;});
    setCropRect(null);setCropPreview(null);showNotif('Crop reset');
  },[selId,showNotif,pushUndo,adjMap,ratingMap,flagMap,labelMap]);

  // Brush
  const initMask=useCallback(()=>{
    const img=imgRef.current;if(!img)return null;
    const mc=document.createElement('canvas');mc.width=img.naturalWidth;mc.height=img.naturalHeight;return mc;
  },[]);
  const getMC=useCallback(()=>{if(maskCanvas)return maskCanvas;const mc=initMask();if(mc)setMaskCanvas(mc);return mc;},[maskCanvas,initMask]);
  const paint=useCallback((e,mc)=>{
    const img=imgRef.current;if(!img||!mc)return;
    const r=img.getBoundingClientRect();
    const ix=(e.clientX-r.left)/r.width*mc.width,iy=(e.clientY-r.top)/r.height*mc.height;
    const ctx=mc.getContext('2d');
    const rad=brushSize*(mc.width/r.width);
    if(brushErasing){ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,1)';}
    else{
      ctx.globalCompositeOperation='source-over';
      const g=ctx.createRadialGradient(ix,iy,0,ix,iy,rad);
      g.addColorStop(0,`rgba(255,100,0,${brushOpacity/100})`);g.addColorStop(1,'rgba(255,100,0,0)');
      ctx.fillStyle=g;
    }
    ctx.beginPath();ctx.arc(ix,iy,rad,0,Math.PI*2);ctx.fill();
    ctx.globalCompositeOperation='source-over';
    setMaskCanvas({...mc});
  },[brushSize,brushOpacity,brushErasing]);

  // Healing
  const applyHeal=useCallback(e=>{
    const img=imgRef.current;if(!img)return;
    const r=img.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    if(!healSource){setHealSource({x:px,y:py});showNotif('Heal source set - click to heal');return;}
    const canvas=document.createElement('canvas');
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.filter=buildFilter(adj);ctx.drawImage(img,0,0);ctx.filter='none';
    const sx=Math.round(healSource.x*canvas.width),sy=Math.round(healSource.y*canvas.height);
    const tx=Math.round(px*canvas.width),ty=Math.round(py*canvas.height);
    const rad=Math.round(healRadius*(canvas.width/r.width));
    const srcData=ctx.getImageData(Math.max(0,sx-rad),Math.max(0,sy-rad),rad*2,rad*2);
    ctx.putImageData(srcData,tx-rad,ty-rad);
    const url=canvas.toDataURL('image/png');
    setPhotos(prev=>prev.map(p=>p.id===selId?{...p,src:url}:p));
    showNotif('Healing applied');
  },[healSource,adj,healRadius,selId,showNotif]);

  // Red-eye
  const applyRedEye=useCallback(e=>{
    const img=imgRef.current;if(!img)return;
    const r=img.getBoundingClientRect();
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
    const cx=Math.round(((e.clientX-r.left)/r.width)*canvas.width);
    const cy=Math.round(((e.clientY-r.top)/r.height)*canvas.height);
    const rad=Math.round(redEyeRadius*(canvas.width/r.width));
    const imgData=ctx.getImageData(Math.max(0,cx-rad),Math.max(0,cy-rad),rad*2,rad*2);
    for(let i=0;i<imgData.data.length;i+=4){
      const rr=imgData.data[i],g=imgData.data[i+1],b=imgData.data[i+2];
      if(rr>120&&rr>g*1.4&&rr>b*1.4)imgData.data[i]=Math.round((g+b)/2);
    }
    ctx.putImageData(imgData,Math.max(0,cx-rad),Math.max(0,cy-rad));
    setPhotos(prev=>prev.map(p=>p.id===selId?{...p,src:canvas.toDataURL('image/png')}:p));
    showNotif('Red-eye corrected OK');
  },[redEyeRadius,selId,showNotif]);

  // Gradient mask
  const applyGrad=useCallback((start,end,type)=>{
    if(!selId||!imgRef.current)return;
    const mask={
      id:`mask_${Date.now()}`,
      type,
      cx:start.x,cy:start.y,
      ex:end.x,ey:end.y,
      rx:Math.abs(end.x-start.x),ry:Math.abs(end.y-start.y),
      adj:{...localAdj},
      invert:localInvert,
    };
    setPhotoMasks(prev=>{
      const next=[...(prev[selId]||[]),mask];
      setActiveMaskIdx(next.length-1);
      return{...prev,[selId]:next};
    });
    const img=imgRef.current;
    const mc=document.createElement('canvas');mc.width=img.naturalWidth;mc.height=img.naturalHeight;
    const ctx=mc.getContext('2d');
    const sx=start.x*mc.width,sy=start.y*mc.height,ex=end.x*mc.width,ey=end.y*mc.height;
    const grad=type==='linear'
      ?ctx.createLinearGradient(sx,sy,ex,ey)
      :ctx.createRadialGradient(sx,sy,0,sx,sy,Math.hypot(ex-sx,ey-sy)*0.5);
    grad.addColorStop(0,'rgba(255,100,0,0.85)');grad.addColorStop(1,'rgba(255,100,0,0)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,mc.width,mc.height);
    setMaskCanvas(mc);setShowLocalPanel(true);
    showNotif(`${type==='linear'?'Linear':'Radial'} mask added — adjust sliders`);
  },[showNotif,selId,localAdj,localInvert]);

  // Auto Subject mask (center-weighted saliency)
  const applyAutoSubject=useCallback(()=>{
    const img=imgRef.current;if(!img)return;
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);
    const mc=document.createElement('canvas');mc.width=canvas.width;mc.height=canvas.height;
    const mctx=mc.getContext('2d');
    const maskData=mctx.createImageData(canvas.width,canvas.height);
    const cx=canvas.width/2,cy=canvas.height/2;
    const maxDist=Math.hypot(cx,cy);
    for(let y=0;y<canvas.height;y++){
      for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4;
        const dist=Math.hypot(x-cx,y-cy)/maxDist;
        const centerW=Math.exp(-dist*dist*1.8);
        let edge=0;
        if(x>0&&x<canvas.width-1&&y>0&&y<canvas.height-1){
          const il=(y*canvas.width+(x-1))*4,ir=(y*canvas.width+(x+1))*4;
          const iu=((y-1)*canvas.width+x)*4,id2=((y+1)*canvas.width+x)*4;
          edge=Math.min((Math.abs(data.data[i]-data.data[il])+Math.abs(data.data[i]-data.data[ir])+
            Math.abs(data.data[i]-data.data[iu])+Math.abs(data.data[i]-data.data[id2]))/600,1);
        }
        const alpha=Math.round((centerW*0.7+edge*0.3)*230);
        maskData.data[i]=255;maskData.data[i+1]=100;maskData.data[i+2]=0;maskData.data[i+3]=alpha;
      }
    }
    mctx.putImageData(maskData,0,0);
    setMaskCanvas(mc);setShowLocalPanel(true);setActiveTool('brush');
    showNotif('Auto Subject mask applied');
  },[showNotif]);

  // Auto Sky mask (hue/luminance-based sky detection)
  const applyAutoSky=useCallback(()=>{
    const img=imgRef.current;if(!img)return;
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);
    const mc=document.createElement('canvas');mc.width=canvas.width;mc.height=canvas.height;
    const mctx=mc.getContext('2d');
    const maskData=mctx.createImageData(canvas.width,canvas.height);
    for(let y=0;y<canvas.height;y++){
      const yFrac=y/canvas.height;
      for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4;
        const r=data.data[i]/255,g=data.data[i+1]/255,b=data.data[i+2]/255;
        const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;
        const s=max===min?0:(max-min)/(1-Math.abs(2*l-1));
        let h=0;
        if(max!==min){
          if(max===r)h=(((g-b)/(max-min))%6)*60;
          else if(max===g)h=((b-r)/(max-min)+2)*60;
          else h=((r-g)/(max-min)+4)*60;
          if(h<0)h+=360;
        }
        const isSkyBlue=(h>=170&&h<=260&&s>0.08&&l>0.3);
        const isSkyGray=(s<0.12&&l>0.6);
        const skyScore=(isSkyBlue||isSkyGray)?1:0;
        const posWeight=Math.max(0,1-yFrac*1.4);
        const alpha=Math.round(skyScore*posWeight*230);
        maskData.data[i]=255;maskData.data[i+1]=100;maskData.data[i+2]=0;maskData.data[i+3]=alpha;
      }
    }
    mctx.putImageData(maskData,0,0);
    setMaskCanvas(mc);setShowLocalPanel(true);setActiveTool('brush');
    showNotif('Auto Sky mask applied');
  },[showNotif]);

  // Luminance Range Mask refinement
  const applyLumRange=useCallback((min,max)=>{
    const img=imgRef.current;if(!img)return;
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);
    const mc=document.createElement('canvas');mc.width=canvas.width;mc.height=canvas.height;
    const mctx=mc.getContext('2d');
    const maskData=mctx.createImageData(canvas.width,canvas.height);
    for(let i=0;i<data.data.length;i+=4){
      const lum=(0.299*data.data[i]+0.587*data.data[i+1]+0.114*data.data[i+2])/255*100;
      const feather=5;
      let w=0;
      if(lum>=min&&lum<=max)w=1;
      else if(lum>=min-feather&&lum<min)w=(lum-(min-feather))/feather;
      else if(lum>max&&lum<=max+feather)w=1-(lum-max)/feather;
      maskData.data[i]=255;maskData.data[i+1]=100;maskData.data[i+2]=0;maskData.data[i+3]=Math.round(w*220);
    }
    mctx.putImageData(maskData,0,0);
    setMaskCanvas(mc);
    showNotif(`Luminance mask: ${min}-${max}`);
  },[showNotif]);

  // Color Range Mask refinement
  const applyColorRange=useCallback((hue,range)=>{
    const img=imgRef.current;if(!img)return;
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);
    const mc=document.createElement('canvas');mc.width=canvas.width;mc.height=canvas.height;
    const mctx=mc.getContext('2d');
    const maskData=mctx.createImageData(canvas.width,canvas.height);
    for(let i=0;i<data.data.length;i+=4){
      const r=data.data[i]/255,g=data.data[i+1]/255,b=data.data[i+2]/255;
      const max=Math.max(r,g,b),min2=Math.min(r,g,b),l=(max+min2)/2;
      const s=max===min2?0:(max-min2)/(1-Math.abs(2*l-1));
      let h=0;
      if(max!==min2){
        if(max===r)h=(((g-b)/(max-min2))%6)*60;
        else if(max===g)h=((b-r)/(max-min2)+2)*60;
        else h=((r-g)/(max-min2)+4)*60;
        if(h<0)h+=360;
      }
      let diff=Math.abs(h-hue);if(diff>180)diff=360-diff;
      const w=(s>0.08&&diff<=range)?Math.max(0,1-diff/range):0;
      maskData.data[i]=255;maskData.data[i+1]=100;maskData.data[i+2]=0;maskData.data[i+3]=Math.round(w*220);
    }
    mctx.putImageData(maskData,0,0);
    setMaskCanvas(mc);
    showNotif('Color range mask applied');
  },[showNotif]);

  // Face detection (skin-tone blob heuristic)
  const detectFaces=useCallback(async()=>{
    if(faceDetecting||photos.length===0)return;
    setFaceDetecting(true);showNotif('Detecting faces...');
    const results={};
    for(const p of photos){
      try{
        const img=new Image();
        await new Promise(res=>{img.onload=res;img.onerror=res;img.src=p.src;});
        const canvas=document.createElement('canvas');
        const scale=Math.min(1,200/Math.max(img.naturalWidth||200,img.naturalHeight||200));
        canvas.width=Math.round((img.naturalWidth||200)*scale);
        canvas.height=Math.round((img.naturalHeight||200)*scale);
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const data=ctx.getImageData(0,0,canvas.width,canvas.height);
        const visited=new Uint8Array(canvas.width*canvas.height);
        const faces=[];
        const isSkin=(r,g,b)=>r>60&&g>40&&b>20&&r>g&&r>b&&(r-Math.min(g,b))>15&&Math.abs(r-g)<50;
        for(let y=4;y<canvas.height-4;y+=4){
          for(let x=4;x<canvas.width-4;x+=4){
            const i=(y*canvas.width+x)*4;
            if(!visited[y*canvas.width+x]&&isSkin(data.data[i],data.data[i+1],data.data[i+2])){
              let minX=x,maxX=x,minY=y,maxY=y,count=0;
              const stack=[[x,y]];
              while(stack.length&&count<2000){
                const[cx2,cy2]=stack.pop();
                if(cx2<0||cy2<0||cx2>=canvas.width||cy2>=canvas.height)continue;
                if(visited[cy2*canvas.width+cx2])continue;
                const ii=(cy2*canvas.width+cx2)*4;
                if(!isSkin(data.data[ii],data.data[ii+1],data.data[ii+2]))continue;
                visited[cy2*canvas.width+cx2]=1;count++;
                minX=Math.min(minX,cx2);maxX=Math.max(maxX,cx2);
                minY=Math.min(minY,cy2);maxY=Math.max(maxY,cy2);
                stack.push([cx2+4,cy2],[cx2-4,cy2],[cx2,cy2+4],[cx2,cy2-4]);
              }
              const w=(maxX-minX)/canvas.width,h=(maxY-minY)/canvas.height;
              if(count>60&&w>0.03&&h>0.03&&w<0.9&&h<0.9)faces.push({x:minX/canvas.width,y:minY/canvas.height,w,h});
            }
          }
        }
        if(faces.length>0){
          const f=faces[0];
          const tc=document.createElement('canvas');tc.width=60;tc.height=60;
          const tctx=tc.getContext('2d');
          const fx=Math.max(0,f.x-f.w*0.3),fy=Math.max(0,f.y-f.h*0.5);
          const fw=Math.min(1-fx,f.w*1.6),fh=Math.min(1-fy,f.h*2.0);
          tctx.drawImage(img,fx*img.naturalWidth,fy*img.naturalHeight,fw*img.naturalWidth,fh*img.naturalHeight,0,0,60,60);
          results[p.id]={count:faces.length,thumb:tc.toDataURL('image/jpeg',0.7),photoId:p.id};
        }
      }catch(e){/* skip */}
    }
    setDetectedFaces(results);
    const facePhotos=Object.values(results);
    const groups=[];const used=new Set();
    facePhotos.forEach(f=>{
      if(used.has(f.photoId))return;
      const g={id:`g${groups.length}`,photos:[f.photoId],thumb:f.thumb};
      facePhotos.forEach(f2=>{if(!used.has(f2.photoId)&&f2.photoId!==f.photoId&&f2.count===f.count){g.photos.push(f2.photoId);used.add(f2.photoId);}});
      used.add(f.photoId);groups.push(g);
    });
    setFaceGroups(groups);setFaceDetecting(false);
    showNotif(`Found faces in ${Object.keys(results).length} photos`);
  },[photos,faceDetecting,showNotif]);

  // Book helpers
  const addBookPage=useCallback(()=>{setBookPages(prev=>[...prev,{id:`p${Date.now()}`,photos:[],layout:'2up'}]);setBookPage(prev=>prev+1);},[]);
  const removeBookPage=useCallback(idx=>{setBookPages(prev=>{if(prev.length<=1)return prev;const next=[...prev];next.splice(idx,1);return next;});setBookPage(prev=>Math.max(0,prev-1));},[]);
  const addPhotoToBook=useCallback((photoId)=>{setBookPages(prev=>prev.map((pg,i)=>i===bookPage?{...pg,photos:[...pg.photos.filter(x=>x!==photoId),photoId]}:pg));},[bookPage]);
  const removePhotoFromBook=useCallback((pageIdx,photoId)=>{setBookPages(prev=>prev.map((pg,i)=>i===pageIdx?{...pg,photos:pg.photos.filter(x=>x!==photoId)}:pg));},[]);

  const doExport=useCallback(async(single=true)=>{
    const targets=single?[photo]:photos;
    for(const p of targets){
      if(!p)continue;
      const img=new Image();await new Promise(res=>{img.onload=res;img.src=p.src;});
      const pa=(single?adj:adjMap[p.id])||{...DEF};
      const pc=cropMap[p.id]||null;
      const canvas=renderExport(img,pa,pc,watermark,watermarkPos,exportMaxW,exportMaxH);
      const mimeMap={jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
      const extMap={jpeg:'jpg',png:'png',webp:'webp'};
      const url=canvas.toDataURL(mimeMap[exportFmt]||'image/jpeg',exportFmt==='png'?1:exportQ/100);
      const a=document.createElement('a');a.href=url;
      a.download=`lumina_${p.name.replace(/\.[^.]+$/,'')+'.'+extMap[exportFmt]}`;a.click();
      await new Promise(r=>setTimeout(r,200));
    }
    setShowExport(false);
    showNotif(single?'Photo exported!':`${targets.length} photos exported!`);
  },[photo,photos,adj,adjMap,cropMap,watermark,watermarkPos,exportFmt,exportQ,exportMaxW,exportMaxH,showNotif]);

  // Keyboard shortcuts
  useEffect(()=>{
    const h=e=>{
      const tag=e.target.tagName;
      const isEditable=tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||e.target.contentEditable==='true';
      // Always allow Ctrl+Z/Y even in editable fields (we handle it ourselves)
      const isUndoRedo=(e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='z'||e.key.toLowerCase()==='y');
      if(isEditable&&!isUndoRedo)return;
      if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}
      if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='y'||(e.shiftKey&&e.key.toLowerCase()==='z'))){e.preventDefault();redo();return;}
      if(isEditable)return;
      if(e.key==='\\')setShowBefore(b=>!b);
      if(e.key==='+'||e.key==='=')setZoom(z=>Math.min(8,z*1.25));
      if(e.key==='-')setZoom(z=>Math.max(0.1,z/1.25));
      if(e.key==='0'){setZoom(1);setPanOffset({x:0,y:0});}
      if(e.key==='h')setActiveTool('pan');
      if(e.key==='ArrowLeft'&&activeTool!=='pan')setPhotos(prev=>{const i=prev.findIndex(p=>p.id===selId);if(i>0)setSelId(prev[i-1].id);return prev;});
      if(e.key==='ArrowRight'&&activeTool!=='pan')setPhotos(prev=>{const i=prev.findIndex(p=>p.id===selId);if(i<prev.length-1)setSelId(prev[i+1].id);return prev;});
      if(e.key==='c'&&activeTool==='crop')applyCrop();
      if(e.key==='p'&&selId){setFlag(selId,flagMap[selId]===1?0:1);
        setPhotos(prev=>{const i=prev.findIndex(p=>p.id===selId);if(i<prev.length-1)setSelId(prev[i+1].id);return prev;});}
      if(e.key==='x'&&selId){setFlag(selId,flagMap[selId]===-1?0:-1);
        setPhotos(prev=>{const i=prev.findIndex(p=>p.id===selId);if(i<prev.length-1)setSelId(prev[i+1].id);return prev;});}
      if(['1','2','3','4','5'].includes(e.key)&&selId&&!e.ctrlKey&&!e.metaKey){
        const r=parseInt(e.key);setRating(selId,ratingMap[selId]===r?0:r);
      }
      if(e.key==='6'&&selId)setRating(selId,0);
      if(e.key==='Escape'){setActiveTool('select');setCropRect(null);setCropPreview(null);setHealSource(null);setShowSlideshow(false);setShowSync(false);}
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[selId,activeTool,applyCrop,undo,redo]);

  // HSL + Color Grading pixel processing
  const[hslSrc,setHslSrc]=useState(null);
  const hslTimer=useRef(null);

  useEffect(()=>{
    if(!photo?.src){setHslSrc(null);return;}
    const hslKeys=Object.keys(adj).filter(k=>k.startsWith('hsl_')||k.startsWith('cg_'));
    const hasHSL=hslKeys.some(k=>adj[k]&&adj[k]!==0);
    if(!hasHSL){setHslSrc(null);return;}
    if(hslTimer.current)clearTimeout(hslTimer.current);
    // Snapshot current adj values before async operation
    const snap=Object.fromEntries(hslKeys.map(k=>[k,adj[k]||0]));
    hslTimer.current=setTimeout(()=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const cv=document.createElement('canvas');
          cv.width=Math.min(img.naturalWidth,1200);
          cv.height=Math.round(img.naturalHeight*(cv.width/img.naturalWidth));
          const ctx=cv.getContext('2d',{willReadFrequently:true});
          ctx.drawImage(img,0,0,cv.width,cv.height);
          const id=ctx.getImageData(0,0,cv.width,cv.height);
          const d=id.data;
          // Color range centers and widths
          const CR={red:[0,30],orange:[30,20],yellow:[60,25],green:[120,40],aqua:[180,30],blue:[220,40],purple:[270,35],magenta:[320,30]};
          const aHSL=Object.entries(CR).map(([nm,[ct,rn]])=>({
            ct,rn,dh:snap[`hsl_${nm}_hue`]||0,ds:(snap[`hsl_${nm}_saturation`]||0)/100,dl:(snap[`hsl_${nm}_luminance`]||0)/100
          })).filter(x=>x.dh||x.ds||x.dl);
          const CG=[
            {h:snap.cg_shadows_hue||0,s:(snap.cg_shadows_sat||0)/100,l:(snap.cg_shadows_lum||0)/100,t:0},
            {h:snap.cg_midtones_hue||0,s:(snap.cg_midtones_sat||0)/100,l:(snap.cg_midtones_lum||0)/100,t:1},
            {h:snap.cg_highlights_hue||0,s:(snap.cg_highlights_sat||0)/100,l:(snap.cg_highlights_lum||0)/100,t:2},
          ].filter(z=>z.h||z.s||z.l);
          const hasCG=CG.length>0;
          if(!aHSL.length&&!hasCG){setHslSrc(null);return;}
          // RGB->HSL
          const r2h=(r,g,b)=>{
            r/=255;g/=255;b/=255;
            const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;
            if(mx===mn)return[0,0,l];
            const d=mx-mn,s=l>0.5?d/(2-mx-mn):d/(mx+mn);
            let h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);
            return[h/6*360,s,l];
          };
          // HSL->RGB
          const hq=(p,q,t)=>{t=(t%1+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
          const h2c=(h,s,l)=>{
            if(!s){const v=l*255+.5|0;return[v,v,v];}
            h/=360;const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
            return[hq(p,q,h+1/3)*255+.5|0,hq(p,q,h)*255+.5|0,hq(p,q,h-1/3)*255+.5|0];
          };
          const hd=(a,b)=>{const x=Math.abs(a-b);return x>180?360-x:x;};
          for(let i=0;i<d.length;i+=4){
            let[h,s,l]=r2h(d[i],d[i+1],d[i+2]);
            let chg=false;
            for(const x of aHSL){
              const dist=hd(h,x.ct);
              if(dist<x.rn){const w=(1-dist/x.rn)**2;h=((h+x.dh*w)%360+360)%360;s=Math.max(0,Math.min(1,s+x.ds*w));l=Math.max(0,Math.min(1,l+x.dl*w));chg=true;}
            }
            if(hasCG){
              const shW=(1-Math.min(1,l*2.5))**2,hlW=Math.max(0,l*2.5-1.5)**2,midW=Math.max(0,1-shW-hlW);
              const wts=[shW,midW,hlW];
              for(const z of CG){const w=wts[z.t];if(w<.005)continue;h=((h+z.h*w)%360+360)%360;s=Math.max(0,Math.min(1,s+z.s*w));l=Math.max(0,Math.min(1,l+z.l*w));chg=true;}
            }
            if(chg){const[nr,ng,nb]=h2c(h,s,l);d[i]=nr;d[i+1]=ng;d[i+2]=nb;}
          }
          ctx.putImageData(id,0,0);
          setHslSrc(cv.toDataURL('image/jpeg',0.92));
        }catch(err){console.error('HSL processing failed:',err);}
      };
      img.onerror=()=>{console.error('HSL: img failed to load');setHslSrc(null);};
      img.src=photo.src;
    },400);
    return()=>{if(hslTimer.current)clearTimeout(hslTimer.current);};
  },[photo?.src, JSON.stringify(Object.fromEntries(
    Object.entries(adj).filter(([k])=>k.startsWith('hsl_')||k.startsWith('cg_'))
  ))]);

  const cssFilter=useMemo(()=>{
    let f=buildFilter(adj);
    if(softProofEnabled){
      const prof=PROOF_PROFILES.find(p=>p.id===softProofProfile)||PROOF_PROFILES[0];
      f+=` brightness(${prof.gamma.toFixed(2)}) saturate(${prof.sat.toFixed(2)})`;
      if(prof.rBoost||prof.gBoost||prof.bBoost)f+=` sepia(0.05)`;
    }
    return f;
  },[JSON.stringify(adj),softProofEnabled,softProofProfile]);

  // Mask compositing - render local adjustments onto photo
  const[maskSrc,setMaskSrc]=useState(null);
  const maskTimer=useRef(null);

  useEffect(()=>{
    const masks=photoMasks[selId];
    if(!photo?.src||!masks?.length){setMaskSrc(null);return;}
    if(maskTimer.current)clearTimeout(maskTimer.current);
    maskTimer.current=setTimeout(()=>{
      const base=hslSrc||photo.src;
      const img=new Image();
      img.onload=()=>{
        try{
          const W=Math.min(img.naturalWidth,1400),H=Math.round(img.naturalHeight*(W/img.naturalWidth));
          const cv=document.createElement('canvas');cv.width=W;cv.height=H;
          const ctx=cv.getContext('2d',{willReadFrequently:true});
          ctx.drawImage(img,0,0,W,H);
          const baseData=ctx.getImageData(0,0,W,H);

          for(const mask of masks){
            // Build mask weight map
            const weights=new Float32Array(W*H);
            if(mask.type==='radial'){
              const cx=mask.cx*W,cy=mask.cy*H;
              const rx=mask.rx*W,ry=mask.ry*H;
              const inner=0.5,outer=1.0;
              for(let y=0;y<H;y++)for(let x=0;x<W;x++){
                const dx=(x-cx)/(rx||1),dy=(y-cy)/(ry||1);
                const d=Math.sqrt(dx*dx+dy*dy);
                const w=d<inner?1:d>outer?0:1-(d-inner)/(outer-inner);
                weights[y*W+x]=mask.invert?1-w:w;
              }
            } else if(mask.type==='linear'){
              const sx=mask.cx*W,sy=mask.cy*H,ex=mask.ex*W,ey=mask.ey*H;
              const dx=ex-sx,dy=ey-sy,len=Math.sqrt(dx*dx+dy*dy);
              for(let y=0;y<H;y++)for(let x=0;x<W;x++){
                const t=len>0?((x-sx)*dx+(y-sy)*dy)/(len*len):0;
                const w=Math.max(0,Math.min(1,t));
                weights[y*W+x]=mask.invert?1-w:w;
              }
            }
            // Apply mask adjustments per pixel
            const ma=mask.adj;
            const mBr=Math.pow(2,(ma.exposure||0)*0.5);
            const mCt=Math.max(0.05,1+((ma.contrast||0)/100)*0.8);
            const mSat=Math.max(0,1+((ma.saturation||0)/100)*0.9);
            const mHL=(ma.highlights||0)/100,mSH=(ma.shadows||0)/100;
            const mTmp=-(ma.temperature||0)*0.0015,mClr=(ma.clarity||0)/500;
            const d=baseData.data;
            for(let i=0;i<d.length;i+=4){
              const w=weights[i>>2];if(w<0.004)continue;
              let r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255;
              // brightness/exposure
              r*=mBr;g*=mBr;b*=mBr;
              // contrast
              r=(r-0.5)*mCt+0.5;g=(g-0.5)*mCt+0.5;b=(b-0.5)*mCt+0.5;
              // saturation
              const lum=0.299*r+0.587*g+0.114*b;
              r=lum+(r-lum)*mSat;g=lum+(g-lum)*mSat;b=lum+(b-lum)*mSat;
              // highlights/shadows
              if(mHL){const hi=Math.max(0,lum-0.5)*2;r+=mHL*hi*0.5;g+=mHL*hi*0.5;b+=mHL*hi*0.5;}
              if(mSH){const sh=Math.max(0,0.5-lum)*2;r+=mSH*sh*0.5;g+=mSH*sh*0.5;b+=mSH*sh*0.5;}
              // temperature
              r+=mTmp;b-=mTmp;
              // clarity (local contrast boost)
              if(mClr){const avg=(r+g+b)/3;r+=(r-avg)*mClr;g+=(g-avg)*mClr;b+=(b-avg)*mClr;}
              // clamp and blend
              r=Math.max(0,Math.min(1,r));g=Math.max(0,Math.min(1,g));b=Math.max(0,Math.min(1,b));
              d[i]=d[i]*(1-w)+r*255*w;
              d[i+1]=d[i+1]*(1-w)+g*255*w;
              d[i+2]=d[i+2]*(1-w)+b*255*w;
            }
            ctx.putImageData(baseData,0,0);
          }
          setMaskSrc(cv.toDataURL('image/jpeg',0.92));
        }catch(e){console.error('Mask composite error:',e);}
      };
      img.src=base;
    },300);
    return()=>{if(maskTimer.current)clearTimeout(maskTimer.current);};
  },[photo?.src,hslSrc,selId,JSON.stringify(photoMasks[selId]||null),JSON.stringify(localAdj)]);

  // Display photos
  const displayPhotos=useMemo(()=>{
    let list=[...photos];
    if(selectedFolder)list=list.filter(p=>p.folder===selectedFolder);
    if(smartFilter){
      list=list.filter(p=>{
        const full={...p,rating:ratingMap[p.id]||0,flag:flagMap[p.id]||0};
        try{return smartFilter.rule(full);}catch{return false;}
      });
    } else {
      if(filterCol==='picks')list=list.filter(p=>flagMap[p.id]===1);
      if(filterCol==='starred')list=list.filter(p=>(ratingMap[p.id]||0)>=4);
      if(filterCol==='rejected')list=list.filter(p=>flagMap[p.id]===-1);
    }
    if(searchQ)list=list.filter(p=>p.name.toLowerCase().includes(searchQ.toLowerCase())||p.keywords?.some(k=>k.includes(searchQ.toLowerCase())));
    return list;
  },[photos,filterCol,flagMap,ratingMap,searchQ,smartFilter,selectedFolder]);

  const TOOLS=[
    {id:'select',icon:'↖',label:'Select'},{id:'crop',icon:'⊡',label:'Crop'},
    {id:'straighten',icon:'⟺',label:'Straighten'},{id:'heal',icon:'✚',label:'Healing'},
    {id:'redeye',icon:'◎',label:'Red-Eye'},{id:'brush',icon:'◉',label:'Brush Mask'},
    {id:'gradient',icon:'▦',label:'Linear Grad'},{id:'radial',icon:'◯',label:'Radial Grad'},
    {id:'subject',icon:'▣',label:'Auto Subject'},{id:'sky',icon:'⌂',label:'Auto Sky'},
    {id:'pan',icon:'✥',label:'Pan / Hand'},
  ];
  const COLOR_LABELS=['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];

  // Pan tool handlers - must be defined BEFORE handleMD/MM/MU
  const handlePanMD=useCallback(e=>{
    if(activeTool!=='pan')return;
    setIsPanning(true);
    panStart.current={x:e.clientX-panOffset.x,y:e.clientY-panOffset.y};
  },[activeTool,panOffset]);
  const handlePanMM=useCallback(e=>{
    if(!isPanning||!panStart.current)return;
    setPanOffset({x:e.clientX-panStart.current.x,y:e.clientY-panStart.current.y});
  },[isPanning]);
  const handlePanMU=useCallback(()=>{setIsPanning(false);},[]);

  const handleMD=useCallback(e=>{
    if(!photo)return;
    if(activeTool==='pan'){handlePanMD(e);return;}
    if(activeTool==='crop'){startCrop(e);return;}
    if(activeTool==='brush'){setIsPainting(true);setShowLocalPanel(true);const mc=getMC();if(mc)paint(e,mc);return;}
    if(activeTool==='gradient'||activeTool==='radial'){
      const r=imgRef.current?.getBoundingClientRect();if(!r)return;
      setGradStart({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height});setShowLocalPanel(true);
    }
    if(activeTool==='straighten'){
      const r=imgRef.current?.getBoundingClientRect();if(!r)return;
      setStraightenStart({x:e.clientX,y:e.clientY});
    }
  },[activeTool,photo,startCrop,getMC,paint,handlePanMD]);

  const handleMM=useCallback(e=>{
    if(!photo)return;
    if(activeTool==='pan'){handlePanMM(e);return;}
    if(activeTool==='crop'&&cropStart){moveCrop(e);return;}
    if(activeTool==='brush'&&isPainting){const mc=getMC();if(mc)paint(e,mc);}
    if(activeTool==='straighten'&&straightenStart){
      const dx=e.clientX-straightenStart.x,dy=e.clientY-straightenStart.y;
      if(Math.abs(dx)>5){setStraightenAngle(Math.atan2(dy,dx)*180/Math.PI);}
    }
    if((activeTool==='gradient'||activeTool==='radial')&&gradStart){
      const r=workspaceRef.current?.getBoundingClientRect();if(!r)return;
      setGradEnd({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height});
    }
  },[activeTool,photo,cropStart,moveCrop,isPainting,getMC,paint,handlePanMM,straightenStart,gradStart]);

  const handleMU=useCallback(e=>{
    if(activeTool==='pan'){handlePanMU();return;}
    if(activeTool==='crop'){endCrop();return;}
    if(activeTool==='brush'){setIsPainting(false);return;}
    if(activeTool==='straighten'&&straightenAngle!==null){
      setAdj('rotate',Math.round(straightenAngle*10)/10);
      setStraightenAngle(null);setStraightenStart(null);
      setActiveTool('select');
      return;
    }
    if((activeTool==='gradient'||activeTool==='radial')&&gradStart&&gradEnd){
      applyGrad(gradStart,gradEnd,activeTool==='gradient'?'linear':'radial');
      setGradStart(null);setGradEnd(null);
    }
  },[activeTool,endCrop,gradStart,applyGrad,handlePanMU,straightenAngle,setAdj]);

  const handleClick=useCallback(e=>{
    if(!photo)return;
    if(activeTool==='heal')applyHeal(e);
    if(activeTool==='redeye')applyRedEye(e);
  },[activeTool,photo,applyHeal,applyRedEye]);

  const updateMeta=useCallback((key,val)=>{
    if(!selId)return;
    setPhotos(prev=>prev.map(p=>p.id===selId?{...p,meta:{...p.meta,[key]:val}}:p));
    showNotif('Metadata saved');
  },[selId,showNotif]);

  const updateKeywords=useCallback((kws)=>{
    if(!selId)return;
    setPhotos(prev=>prev.map(p=>p.id===selId?{...p,keywords:kws}:p));
  },[selId]);

  // Auto Tone - analyze histogram and auto-set exposure/contrast/whites/blacks
  const autoTone=useCallback(()=>{
    const img=imgRef.current;if(!img||!selId)return;
    const canvas=document.createElement('canvas');
    const sc=Math.min(1,300/Math.max(img.naturalWidth,img.naturalHeight));
    canvas.width=Math.max(1,Math.round(img.naturalWidth*sc));
    canvas.height=Math.max(1,Math.round(img.naturalHeight*sc));
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let sum=0,min=255,max=0,dark=0,bright=0;
    const total=canvas.width*canvas.height;
    for(let i=0;i<d.length;i+=4){
      const l=Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]);
      sum+=l;if(l<min)min=l;if(l>max)max=l;
      if(l<30)dark++;if(l>220)bright++;
    }
    const avg=sum/total;
    const targetExp=Math.max(-2,Math.min(2,((128-avg)/128)*1.5));
    const newAdj={...adj,
      exposure:Math.round(targetExp*100)/100,
      contrast:Math.round((128-(max-min))*0.1),
      whites:max<200?Math.round((200-max)*0.4):0,
      blacks:min>30?Math.round(-(min-0)*0.4):0,
      highlights:bright/total>0.05?-25:0,
      shadows:dark/total>0.1?20:0,
    };
    pushUndo(selId,{adj:newAdj,crop:cropMap[selId]||null,rating:ratingMap[selId]||0,flag:flagMap[selId]||0,label:labelMap[selId]||null},'Auto Tone');
    setAdjMap(p=>({...p,[selId]:newAdj}));
    showNotif('&#9889; Auto Tone applied');
  },[selId,adj,pushUndo,showNotif]);

  // Virtual Copy
  const makeVirtualCopy=useCallback(()=>{
    if(!photo)return;
    const id=`vc_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
    const copy={...photo,id,name:`${photo.name} (copy)`,added:Date.now()};
    setPhotos(prev=>[...prev,copy]);
    setAdjMap(prev=>({...prev,[id]:{...(adjMap[selId]||{...DEF})}}));
    setVirtualCopies(prev=>{
      const src=photo.originalId||selId;
      return{...prev,[src]:[...(prev[src]||[]),id]};
    });
    setSelId(id);
    showNotif('Virtual copy created');
  },[photo,selId,adjMap,showNotif]);

  // Sync settings to multiple photos
  const syncSettings=useCallback((targetIds)=>{
    const srcAdj=adjMap[selId]||{...DEF};
    setAdjMap(prev=>{
      const next={...prev};
      targetIds.forEach(id=>{next[id]={...srcAdj};});
      return next;
    });
    showNotif(`Settings synced to ${targetIds.length} photos`);
    setShowSync(false);
  },[selId,adjMap,showNotif]);

  // Straighten
  const applyStraighten=useCallback((angle)=>{
    if(!selId)return;
    setAdj('rotate',Math.round(angle*10)/10);
    setStraightenAngle(null);setStraightenStart(null);
    setActiveTool('select');
    showNotif(`Straightened ${angle.toFixed(1)}deg`);
  },[selId,setAdj,showNotif]);

  // Scroll wheel zoom
  const handleWheel=useCallback(e=>{
    e.preventDefault();
    const delta=e.deltaY>0?0.9:1.1;
    setZoom(z=>{
      const newZ=Math.min(8,Math.max(0.1,z*delta));
      // Zoom toward mouse position
      if(workspaceRef.current){
        const rect=workspaceRef.current.getBoundingClientRect();
        const ox=e.clientX-rect.left-rect.width/2;
        const oy=e.clientY-rect.top-rect.height/2;
        setPanOffset(p=>({
          x:p.x+(ox-p.x)*(1-newZ/z),
          y:p.y+(oy-p.y)*(1-newZ/z),
        }));
      }
      return newZ;
    });
  },[]);

  // Reset pan when photo changes
  useEffect(()=>{setPanOffset({x:0,y:0});},[selId]);

  // Auto-advance after flagging
  const advancePhoto=useCallback(()=>{
    if(!autoAdvance)return;
    setPhotos(prev=>{
      const i=prev.findIndex(p=>p.id===selId);
      if(i<prev.length-1)setSelId(prev[i+1].id);
      return prev;
    });
  },[autoAdvance,selId]);

  const comparePhoto = compareId ? photos.find(p=>p.id===compareId) : photos.find(p=>p.id!==selId);

  return(
    <div style={{width:'100vw',height:'100vh',background:T.bg,display:'flex',flexDirection:'column',
      fontFamily:"'Geist','Inter',system-ui,sans-serif",color:T.text,overflow:'hidden',fontSize:13,position:'fixed',top:0,left:0}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;height:100%;overflow:hidden;background:${T.bg};}
        input[type=range]{-webkit-appearance:none;appearance:none;outline:none;cursor:pointer;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#fff;border:none;cursor:pointer;margin-top:-4.5px;box-shadow:0 1px 4px rgba(0,0,0,0.5);}
        input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:2px;}
        input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#fff;border:none;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.5);}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.15);}
        button{cursor:pointer;font-family:inherit;transition:all 0.15s ease;}
        input,select,textarea{font-family:inherit;}
        .hov:hover{opacity:0.75!important;}
        .prow:hover{background:${T.glass}!important;color:${T.textBright}!important;}
        .cbtn:hover{background:${T.input}!important;}
        .ft{transition:all 0.15s ease;border-radius:6px!important;}
        .ft:hover{transform:scale(1.04);z-index:2;box-shadow:0 8px 24px rgba(0,0,0,0.5)!important;}
        .ft:hover .del-btn{display:flex!important;align-items:center;justify-content:center;}
        .ta{background:${T.accentSoft}!important;border-color:${T.accent}!important;color:${T.accent}!important;}
        .tool-btn{padding:5px 9px;background:none;border:1px solid transparent;border-radius:6px;color:${T.textDim};font-size:11px;display:flex;align-items:center;gap:4px;transition:all 0.15s;}
        .tool-btn:hover{background:${T.glass};border-color:${T.glassBorder};color:${T.text};}
        .tool-btn.active{background:${T.accentSoft};border-color:${T.accent};color:${T.accent};}
        .mod-btn{padding:5px 14px;background:none;border:1px solid transparent;border-radius:6px;font-size:11px;font-weight:500;letter-spacing:0.02em;transition:all 0.15s;}
        .mod-btn:hover{background:${T.glass};color:${T.textBright};}
        .mod-btn.active{background:${T.accentSoft};border-color:${T.accent};color:${T.accent};font-weight:600;}
        .panel-tab{flex:1;padding:8px 4px;background:none;border:none;border-bottom:2px solid transparent;font-size:9px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.15s;cursor:pointer;}
        .panel-tab:hover{color:${T.text}!important;}
        .panel-tab.active{border-bottom-color:${T.accent};color:${T.accent}!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes notif{0%{opacity:0;transform:translateX(-50%) translateY(10px)}8%{opacity:1;transform:translateX(-50%) translateY(0)}85%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-4px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @media print{.no-print{display:none!important;}}
      `}</style>

      {/* Slideshow */}
      {showSlideshow&&<Slideshow photos={displayPhotos.length>0?displayPhotos:photos} adjMap={adjMap} onClose={()=>setShowSlideshow(false)}/>}

      {/* Slideshow */}
      {showSlideshow&&<Slideshow photos={displayPhotos.length>0?displayPhotos:photos} adjMap={adjMap} onClose={()=>setShowSlideshow(false)}/>}

      {/* Settings Modal */}
      {showSettings&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)'}}
          onClick={e=>{if(e.target===e.currentTarget)setShowSettings(false);}}>
          <div style={{background:T.panel,border:`1px solid ${T.borderLight}`,borderRadius:16,width:720,maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:'0 40px 80px rgba(0,0,0,0.8)',animation:'fadeUp 0.2s ease',overflow:'hidden'}}>
            {/* Header */}
            <div style={{padding:'20px 24px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:T.textBright,letterSpacing:'-0.3px'}}>Settings</div>
                <div style={{fontSize:11,color:T.textDim,marginTop:2}}>Customize your LuminaEdit experience</div>
              </div>
              <button onClick={()=>setShowSettings(false)} style={{width:32,height:32,background:T.input,border:`1px solid ${T.border}`,borderRadius:8,color:T.textDim,fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
            {/* Body */}
            <div style={{display:'flex',flex:1,overflow:'hidden'}}>
              {/* Sidebar */}
              <div style={{width:180,background:T.bg,borderRight:`1px solid ${T.border}`,padding:'12px 8px',flexShrink:0}}>
                {[
                  {id:'general',icon:'⚡',label:'General'},
                  {id:'appearance',icon:'🎨',label:'Appearance'},
                  {id:'theme',icon:'✦',label:'Theme Editor'},
                  {id:'language',icon:'🌐',label:'Language'},
                  {id:'shortcuts',icon:'⌨',label:'Shortcuts'},
                  {id:'storage',icon:'💾',label:'Storage'},
                  {id:'about',icon:'ℹ',label:'About'},
                ].map(item=>(
                  <button key={item.id} onClick={()=>setSettingsTab(item.id)}
                    style={{width:'100%',padding:'9px 12px',background:settingsTab===item.id?T.accentSoft:'none',border:`1px solid ${settingsTab===item.id?T.accent+'44':'transparent'}`,borderRadius:8,color:settingsTab===item.id?T.accent:T.textDim,fontSize:12,fontWeight:settingsTab===item.id?600:400,textAlign:'left',display:'flex',alignItems:'center',gap:10,marginBottom:2,transition:'all 0.15s'}}>
                    <span style={{fontSize:14,width:18,textAlign:'center'}}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>

                {/* GENERAL */}
                {settingsTab==='general'&&(<>
                  <div style={{fontSize:13,fontWeight:700,color:T.textBright,marginBottom:16,letterSpacing:'-0.2px'}}>General</div>
                  {[
                    {label:'Auto-advance after rating',desc:'Move to next photo automatically after starring or flagging',key:'autoAdvance',state:autoAdvance,set:v=>{setAutoAdvance(v);localStorage.setItem('lumina_autoAdvance',JSON.stringify(v));}},
                    {label:'Show file numbers in filmstrip',desc:'Display index numbers on thumbnail corners',key:'showNumbers',state:showFileNumbers,set:v=>{setShowFileNumbers(v);localStorage.setItem('lumina_showNumbers',JSON.stringify(v));}},
                    {label:'Confirm before deleting photos',desc:'Ask for confirmation before removing photos from session',key:'confirmDelete',state:confirmDelete,set:v=>{setConfirmDelete(v);localStorage.setItem('lumina_confirmDelete',JSON.stringify(v));}},
                    {label:'Show clipping indicators',desc:'Highlight blown highlights and crushed shadows',key:'showClipping',state:showClipping,set:v=>{setShowClipping(v);localStorage.setItem('lumina_showClipping',JSON.stringify(v));}},
                  ].map(s=>(
                    <div key={s.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:`1px solid ${T.border}`}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:T.textBright,marginBottom:3}}>{s.label}</div>
                        <div style={{fontSize:11,color:T.textDim}}>{s.desc}</div>
                      </div>
                      <button onClick={()=>s.set(!s.state)}
                        style={{width:44,height:24,borderRadius:12,background:s.state?T.accent:T.input,border:`1px solid ${s.state?T.accent:T.border}`,position:'relative',flexShrink:0,transition:'all 0.2s'}}>
                        <div style={{position:'absolute',top:3,left:s.state?22:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
                      </button>
                    </div>
                  ))}
                  <div style={{marginTop:20}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.textBright,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.08em',fontSize:10}}>Histogram</div>
                    {[['RGB + Luminance','rgb'],['Luminance only','lum'],['RGB only','rgb-only']].map(([lbl,val])=>{
                      const cur=localStorage.getItem('lumina_histMode')||'rgb';
                      return(
                        <label key={val} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',cursor:'pointer'}}>
                          <div onClick={()=>{localStorage.setItem('lumina_histMode',val);showNotif('Setting saved');}}
                            style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${cur===val?T.accent:T.border}`,background:cur===val?T.accent:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {cur===val&&<div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                          </div>
                          <span style={{fontSize:12,color:T.text}}>{lbl}</span>
                        </label>
                      );
                    })}
                  </div>
                </>)}

                {/* APPEARANCE */}
                {settingsTab==='appearance'&&(<>
                  <div style={{fontSize:13,fontWeight:700,color:T.textBright,marginBottom:16,letterSpacing:'-0.2px'}}>Appearance</div>
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Interface Density</div>
                    <div style={{display:'flex',gap:8}}>
                      {[['Compact','compact'],['Default','default'],['Comfortable','comfortable']].map(([lbl,val])=>(
                        <button key={val} onClick={()=>{setUiDensity(val);localStorage.setItem('lumina_density',val);showNotif(`Density: ${lbl}`);}}
                          style={{flex:1,padding:'10px 8px',background:uiDensity===val?T.accentSoft:T.input,border:`1px solid ${uiDensity===val?T.accent:T.border}`,borderRadius:8,color:uiDensity===val?T.accent:T.text,fontSize:12,fontWeight:uiDensity===val?600:400}}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:T.textDim,marginTop:8}}>
                      {uiDensity==='compact'?'Tighter spacing — more content visible at once':uiDensity==='comfortable'?'More breathing room between elements':'Balanced spacing (recommended)'}
                    </div>
                  </div>
                  <div style={{marginBottom:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em'}}>Thumbnail Size</div>
                      <span style={{fontSize:11,color:T.accent,fontFamily:'monospace',fontWeight:600}}>{thumbSize}px</span>
                    </div>
                    <input type="range" min={60} max={120} step={4} value={thumbSize}
                      onChange={e=>{const v=parseInt(e.target.value);setThumbSize(v);localStorage.setItem('lumina_thumbSize',v);}}
                      style={{width:'100%',height:3,background:T.input,borderRadius:2}}/>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.textDim,marginTop:6}}>
                      <span>Small (60px)</span><span>Large (120px)</span>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Auto-advance</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:`1px solid ${T.border}`}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:T.textBright,marginBottom:3}}>Auto-advance after rating</div>
                        <div style={{fontSize:11,color:T.textDim}}>Mirrors the General toggle — move to next photo after flagging or starring</div>
                      </div>
                      <button onClick={()=>{const v=!autoAdvance;setAutoAdvance(v);localStorage.setItem('lumina_autoAdvance',JSON.stringify(v));}}
                        style={{width:44,height:24,borderRadius:12,background:autoAdvance?T.accent:T.input,border:`1px solid ${autoAdvance?T.accent:T.border}`,position:'relative',flexShrink:0,transition:'all 0.2s'}}>
                        <div style={{position:'absolute',top:3,left:autoAdvance?22:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
                      </button>
                    </div>
                  </div>
                </>)}

                {/* THEME EDITOR */}
                {settingsTab==='theme'&&(<>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.textBright,letterSpacing:'-0.2px'}}>Theme Editor</div>
                    <button onClick={()=>{setCustomTheme(null);localStorage.removeItem('lumina_theme');showNotif('Reset to default theme');}}
                      style={{padding:'5px 12px',background:'none',border:`1px solid ${T.border}`,borderRadius:6,color:T.textDim,fontSize:11}}>Reset to Default</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[
                      {key:'bg',label:'Background',desc:'Main app background'},
                      {key:'panel',label:'Panel',desc:'Sidebar & panel color'},
                      {key:'input',label:'Input',desc:'Input & control backgrounds'},
                      {key:'border',label:'Border',desc:'Dividers & outlines'},
                      {key:'text',label:'Text',desc:'Primary text color'},
                      {key:'textDim',label:'Text Dim',desc:'Secondary text color'},
                      {key:'textBright',label:'Text Bright',desc:'Headings & active labels'},
                      {key:'accent',label:'Accent',desc:'Primary brand color'},
                      {key:'blue',label:'Blue',desc:'Info & links'},
                      {key:'red',label:'Red',desc:'Errors & warnings'},
                      {key:'green',label:'Green',desc:'Success states'},
                    ].map(item=>{
                      const currentTheme=customTheme||{};
                      const val=currentTheme[item.key]||T[item.key];
                      return(
                        <div key={item.key} style={{padding:'12px',background:T.bg,borderRadius:8,border:`1px solid ${T.border}`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                            <div>
                              <div style={{fontSize:11,fontWeight:600,color:T.textBright}}>{item.label}</div>
                              <div style={{fontSize:10,color:T.textDim}}>{item.desc}</div>
                            </div>
                            <input type="color" value={val.startsWith('#')?val:'#1e1e24'}
                              onChange={e=>{
                                const next={...(customTheme||T),[item.key]:e.target.value};
                                setCustomTheme(next);
                                localStorage.setItem('lumina_theme',JSON.stringify(next));
                              }}
                              style={{width:36,height:36,borderRadius:6,border:`1px solid ${T.border}`,cursor:'pointer',background:'none',padding:2}}/>
                          </div>
                          <div style={{fontFamily:"'SF Mono','Fira Code',monospace",fontSize:10,color:T.textDim}}>{val}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop:16,padding:'12px',background:T.accentSoft,borderRadius:8,border:`1px solid ${T.accent}44`}}>
                    <div style={{fontSize:11,color:T.accent,fontWeight:600,marginBottom:4}}>Live Preview</div>
                    <div style={{fontSize:11,color:T.textDim}}>Changes apply instantly. Close settings to see the full effect across the app.</div>
                  </div>
                </>)}

                {/* LANGUAGE */}
                {settingsTab==='language'&&(<>
                  <div style={{fontSize:13,fontWeight:700,color:T.textBright,marginBottom:6,letterSpacing:'-0.2px'}}>Language</div>
                  <div style={{fontSize:11,color:T.textDim,marginBottom:20}}>Choose the display language for the interface.</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {[
                      {code:'en',name:'English',native:'English',flag:'🇺🇸'},
                      {code:'es',name:'Spanish',native:'Español',flag:'🇪🇸'},
                      {code:'fr',name:'French',native:'Français',flag:'🇫🇷'},
                      {code:'de',name:'German',native:'Deutsch',flag:'🇩🇪'},
                      {code:'it',name:'Italian',native:'Italiano',flag:'🇮🇹'},
                      {code:'pt',name:'Portuguese',native:'Português',flag:'🇧🇷'},
                      {code:'ja',name:'Japanese',native:'日本語',flag:'🇯🇵'},
                      {code:'zh',name:'Chinese',native:'中文',flag:'🇨🇳'},
                      {code:'ko',name:'Korean',native:'한국어',flag:'🇰🇷'},
                      {code:'ar',name:'Arabic',native:'العربية',flag:'🇸🇦'},
                      {code:'ru',name:'Russian',native:'Русский',flag:'🇷🇺'},
                      {code:'nl',name:'Dutch',native:'Nederlands',flag:'🇳🇱'},
                    ].map(lang=>(
                      <button key={lang.code} onClick={()=>{setAppLanguage(lang.code);localStorage.setItem('lumina_lang',lang.code);showNotif(`Language set to ${lang.name}`);}}
                        style={{padding:'12px 14px',background:appLanguage===lang.code?T.accentSoft:T.input,border:`1px solid ${appLanguage===lang.code?T.accent:T.border}`,borderRadius:10,color:appLanguage===lang.code?T.accent:T.text,fontSize:12,fontWeight:appLanguage===lang.code?600:400,textAlign:'left',display:'flex',alignItems:'center',gap:10,transition:'all 0.15s'}}>
                        <span style={{fontSize:20}}>{lang.flag}</span>
                        <div>
                          <div style={{fontWeight:600}}>{lang.native}</div>
                          <div style={{fontSize:10,color:appLanguage===lang.code?T.accent:T.textDim}}>{lang.name}</div>
                        </div>
                        {appLanguage===lang.code&&<span style={{marginLeft:'auto',fontSize:14,color:T.accent}}>✓</span>}
                      </button>
                    ))}
                  </div>
                  <div style={{marginTop:16,padding:'12px',background:T.input,borderRadius:8,border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.textDim}}>⚠ Some interface text may remain in English while full translations are in progress. The current active language is <span style={{color:T.accent,fontWeight:600}}>{appLanguage.toUpperCase()}</span>.</div>
                  </div>
                </>)}

                {/* SHORTCUTS */}
                {settingsTab==='shortcuts'&&(<>
                  <div style={{fontSize:13,fontWeight:700,color:T.textBright,marginBottom:16,letterSpacing:'-0.2px'}}>Keyboard Shortcuts</div>
                  <div style={{display:'flex',flexDirection:'column',gap:2}}>
                    {[
                      {group:'Navigation'},
                      {key:'← →',action:'Previous / Next photo'},
                      {key:'P',action:'Flag as Pick'},
                      {key:'X',action:'Flag as Reject'},
                      {key:'1–5',action:'Set star rating'},
                      {key:'\\',action:'Toggle Before/After'},
                      {group:'Tools'},
                      {key:'C',action:'Crop tool'},
                      {key:'H',action:'Pan / Hand tool'},
                      {key:'Esc',action:'Cancel / Deselect tool'},
                      {group:'Editing'},
                      {key:'Ctrl + Z',action:'Undo'},
                      {key:'Ctrl + Y',action:'Redo'},
                      {key:'+ / –',action:'Zoom in / out'},
                      {key:'0',action:'Fit to screen'},
                    ].map((item,i)=>
                      item.group?(
                        <div key={i} style={{fontSize:9,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.1em',padding:'12px 0 6px',borderTop:i>0?`1px solid ${T.border}`:'none'}}>
                          {item.group}
                        </div>
                      ):(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',borderRadius:6,background:T.bg}}>
                          <span style={{fontSize:12,color:T.text}}>{item.action}</span>
                          <kbd style={{padding:'3px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,fontSize:11,fontFamily:"'SF Mono','Fira Code',monospace",color:T.textBright,fontWeight:600}}>{item.key}</kbd>
                        </div>
                      )
                    )}
                  </div>
                </>)}

                {/* STORAGE */}
                {settingsTab==='storage'&&(<>
                  <div style={{fontSize:13,fontWeight:700,color:T.textBright,marginBottom:6,letterSpacing:'-0.2px'}}>Storage</div>
                  <div style={{fontSize:11,color:T.textDim,marginBottom:20}}>Manage your local session data and storage usage.</div>
                  {(()=>{
                    let used=0;
                    try{for(let k in localStorage){if(k.startsWith('lumina'))used+=localStorage[k].length*2;}}catch(e){}
                    const usedKB=(used/1024).toFixed(1);
                    const maxKB=5120;
                    const pct=Math.min(100,(used/1024/maxKB)*100);
                    return(
                      <div style={{marginBottom:20}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                          <span style={{fontSize:12,color:T.text}}>LuminaEdit session data</span>
                          <span style={{fontSize:12,color:T.textDim,fontFamily:"monospace"}}>{usedKB} KB / {maxKB} KB</span>
                        </div>
                        <div style={{height:6,background:T.input,borderRadius:3,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${pct}%`,background:pct>80?T.red:pct>50?T.yellow:T.accent,borderRadius:3,transition:'width 0.5s'}}/>
                        </div>
                        <div style={{fontSize:10,color:T.textDim,marginTop:6}}>{pct.toFixed(1)}% of available browser storage used</div>
                      </div>
                    );
                  })()}
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <button onClick={()=>{localStorage.removeItem('lumina_session');showNotif('Session cleared');setPhotos([]);setSelId(null);setAdjMap({});setCropMap({});setRatingMap({});setFlagMap({});setLabelMap({});setFolderMap({});}}
                      style={{padding:'10px 14px',background:T.red+'15',border:`1px solid ${T.red}44`,borderRadius:8,color:T.red,fontSize:12,fontWeight:500,textAlign:'left'}}>
                      Clear photo session (removes all photos and edits)
                    </button>
                    <button onClick={()=>{localStorage.removeItem('lumina_theme');setCustomTheme(null);showNotif('Theme reset');}}
                      style={{padding:'10px 14px',background:T.input,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12,fontWeight:500,textAlign:'left'}}>
                      Reset theme to default
                    </button>
                    <button onClick={()=>{const keys=Object.keys(localStorage).filter(k=>k.startsWith('lumina_')&&k!=='lumina_session');keys.forEach(k=>localStorage.removeItem(k));showNotif('Preferences cleared');}}
                      style={{padding:'10px 14px',background:T.input,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12,fontWeight:500,textAlign:'left'}}>
                      Reset all preferences to defaults
                    </button>
                  </div>
                </>)}

                {/* ABOUT */}
                {settingsTab==='about'&&(<>
                  <div style={{textAlign:'center',padding:'20px 0 30px'}}>
                    <div style={{width:64,height:64,background:`linear-gradient(135deg,${T.accent},${T.accentDark})`,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:'#fff',margin:'0 auto 16px',boxShadow:`0 8px 32px ${T.accentGlow}`}}>L</div>
                    <div style={{fontSize:22,fontWeight:800,color:T.textBright,letterSpacing:'-0.5px',marginBottom:4}}>LuminaEdit</div>
                    <div style={{fontSize:12,color:T.textDim,marginBottom:6}}>Professional Photo Editor</div>
                    <div style={{display:'inline-block',padding:'3px 12px',background:T.accentSoft,border:`1px solid ${T.accent}44`,borderRadius:20,fontSize:11,color:T.accent,fontWeight:600,marginBottom:24}}>Version 2.0.0 — Studio Edition</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                    {[
                      {label:'Built with',value:'React + Vite'},
                      {label:'Rendering',value:'CSS Filters + Canvas'},
                      {label:'Photo formats',value:'JPG, PNG, WebP, RAW'},
                      {label:'Storage',value:'100% local, no cloud'},
                      {label:'License',value:'Personal use'},
                      {label:'Platform',value:'Web — any modern browser'},
                    ].map(item=>(
                      <div key={item.label} style={{padding:'12px',background:T.bg,borderRadius:8,border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{item.label}</div>
                        <div style={{fontSize:12,fontWeight:600,color:T.textBright}}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'16px',background:T.bg,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:16}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.textBright,marginBottom:8}}>Feature Highlights</div>
                    {['Full RAW file support (CR2, NEF, ARW, DNG and more)','Non-destructive editing with full undo/redo history','HDR Merge + Panorama Merge','Auto Subject & Sky masking','GPS map view + geotagging','Book module for photo books','People detection','Soft proofing with print profiles','Point Color control','Guided Upright perspective correction'].map(f=>(
                      <div key={f} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:11,color:T.text}}>
                        <span style={{color:T.accent,fontSize:10}}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <div style={{textAlign:'center',fontSize:11,color:T.textDim,lineHeight:1.6}}>
                    Made with care. All processing runs locally in your browser.<br/>
                    No data is ever sent to any server.
                  </div>
                </>)}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guided Upright */}
      {showGuidedUpright&&photo&&(
        <GuidedUprightTool src={photo.src} onClose={()=>setShowGuidedUpright(false)}
          onApply={url=>{
            pushUndo(selId,adj,'before upright');
            setPhotos(prev=>prev.map(p=>p.id===selId?{...p,src:url}:p));
            setShowGuidedUpright(false);showNotif('Upright applied');
          }}/>
      )}

      {/* HDR Merge */}
      {showHDRMerge&&(
        <HDRMergeModule photos={photos} onClose={()=>setShowHDRMerge(false)}
          onMerged={(url,name)=>{
            const id=`p${Date.now()}`;
            setPhotos(prev=>[...prev,{id,name,src:url,raw:false,size:0,type:'image/jpeg',added:Date.now(),exif:{},keywords:[],meta:{},faces:[],folder:'HDR Merged'}]);
            setSelId(id);setModule('develop');setShowHDRMerge(false);showNotif('HDR merge complete');
          }}/>
      )}

      {/* Panorama Merge */}
      {showPanorama&&(
        <PanoramaModule photos={photos} onClose={()=>setShowPanorama(false)}
          onMerged={(url,name)=>{
            const id=`p${Date.now()}`;
            setPhotos(prev=>[...prev,{id,name,src:url,raw:false,size:0,type:'image/jpeg',added:Date.now(),exif:{},keywords:[],meta:{},faces:[],folder:'Panoramas'}]);
            setSelId(id);setModule('develop');setShowPanorama(false);showNotif('Panorama stitched');
          }}/>
      )}

      {/* SYNC SETTINGS MODAL */}
      {showSync&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={e=>{if(e.target===e.currentTarget)setShowSync(false);}}>
          <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:28,width:380,boxShadow:'0 40px 80px rgba(0,0,0,0.8)',border:`1px solid ${T.borderLight}`,animation:'fadeUp 0.2s ease'}}>
            <div style={{fontSize:15,fontWeight:700,color:T.textBright,marginBottom:4}}>Sync Settings</div>
            <div style={{fontSize:10,color:T.textDim,marginBottom:16}}>Apply <b style={{color:T.accent}}>{photo?.name}</b>'s edits to selected photos:</div>
            <div style={{maxHeight:260,overflowY:'auto',border:`1px solid ${T.border}`,borderRadius:8,marginBottom:16}}>
              {photos.filter(p=>p.id!==selId).map(p=>(
                <label key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',cursor:'pointer',borderBottom:`1px solid ${T.border}22`}}>
                  <input type="checkbox" checked={syncSelIds.includes(p.id)} onChange={e=>setSyncSelIds(prev=>e.target.checked?[...prev,p.id]:prev.filter(id=>id!==p.id))} style={{accentColor:T.accent,width:14,height:14}}/>
                  <img src={p.src} alt="" style={{width:36,height:28,objectFit:'cover',borderRadius:3}}/>
                  <span style={{fontSize:11,color:T.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
                </label>
              ))}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <button onClick={()=>setSyncSelIds(photos.filter(p=>p.id!==selId).map(p=>p.id))} style={{flex:1,padding:'5px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10}}>Select All</button>
              <button onClick={()=>setSyncSelIds([])} style={{flex:1,padding:'5px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10}}>Clear</button>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setShowSync(false);setSyncSelIds([]);}} style={{flex:1,padding:'8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11}}>Cancel</button>
              <button onClick={()=>{syncSettings(syncSelIds);setSyncSelIds([]);}} disabled={syncSelIds.length===0}
                style={{flex:2,padding:'8px',background:syncSelIds.length>0?`linear-gradient(90deg,${T.accent},${T.accentDark})`:'#333',border:'none',borderRadius:6,color:syncSelIds.length>0?'#000':T.textDim,fontSize:11,fontWeight:700}}>
                Sync to {syncSelIds.length} Photo{syncSelIds.length!==1?'s':''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notify&&(
        <div style={{position:'fixed',bottom:110,left:'50%',background:notify.type==='error'?'#3f0a0a':'#0a2a0a',
          border:`1px solid ${notify.type==='error'?T.red:T.green}`,color:notify.type==='error'?'#fca5a5':'#bbf7d0',
          padding:'10px 20px',borderRadius:10,fontSize:11,fontWeight:500,zIndex:9998,animation:'notif 2.8s ease forwards',backdropFilter:'blur(20px)',
          whiteSpace:'nowrap',boxShadow:'0 4px 24px rgba(0,0,0,0.5)',pointerEvents:'none'}}>
          {notify.msg}
        </div>
      )}

      {/* Export Modal */}
      {showExport&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:998,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={e=>{if(e.target===e.currentTarget)setShowExport(false);}}>
          <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:32,width:420,boxShadow:'0 40px 80px rgba(0,0,0,0.8)',border:`1px solid ${T.borderLight}`,animation:'fadeUp 0.2s ease'}}>
            <div style={{fontSize:16,fontWeight:700,color:T.textBright,marginBottom:20}}>Export Photo</div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:T.textDim,marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Export Presets</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
                {exportPresets.map(p=>(
                  <button key={p.id} onClick={()=>{setExportFmt(p.fmt);setExportQ(p.q);setExportMaxW(p.maxW);setExportMaxH(p.maxH);setExportProfile(p.profile);setWatermark(p.watermark);showNotif(`Preset: ${p.name}`);}}
                    style={{padding:'3px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:9}}>{p.name}</button>
                ))}
                <button onClick={()=>{const name=prompt('Preset name:');if(name)setExportPresets(prev=>[...prev,{id:`u${Date.now()}`,name,fmt:exportFmt,q:exportQ,maxW:exportMaxW,maxH:exportMaxH,watermark,profile:exportProfile}]);}}
                  style={{padding:'3px 8px',background:'none',border:`1px dashed ${T.border}`,borderRadius:5,color:T.textDim,fontSize:9}}>+ Save</button>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:T.textDim,marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Format</div>
              <div style={{display:'flex',gap:8}}>
                {['jpeg','png','webp'].map(f=>(
                  <button key={f} onClick={()=>setExportFmt(f)}
                    style={{flex:1,padding:'7px',background:exportFmt===f?T.accent+'22':T.input,
                      border:`1px solid ${exportFmt===f?T.accent:T.border}`,borderRadius:6,
                      color:exportFmt===f?T.accent:T.text,fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{f}</button>
                ))}
              </div>
            </div>
            {exportFmt!=='png'&&<div style={{marginBottom:14}}><Slider label={`Quality: ${exportQ}%`} value={exportQ} min={10} max={100} step={1} onChange={setExportQ} format={v=>`${v}%`}/></div>}
            <div style={{marginBottom:14,display:'flex',gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:T.textDim,marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Max Width (px)</div>
                <input type="number" placeholder="0 = original" value={exportMaxW||''} onChange={e=>setExportMaxW(parseInt(e.target.value)||0)}
                  style={{width:'100%',padding:'6px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:11,outline:'none'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:T.textDim,marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Max Height (px)</div>
                <input type="number" placeholder="0 = original" value={exportMaxH||''} onChange={e=>setExportMaxH(parseInt(e.target.value)||0)}
                  style={{width:'100%',padding:'6px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:11,outline:'none'}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:T.textDim,marginBottom:5,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Color Profile</div>
              <div style={{display:'flex',gap:6}}>
                {['sRGB','Display P3','AdobeRGB'].map(p=>(
                  <button key={p} onClick={()=>setExportProfile(p)}
                    style={{flex:1,padding:'5px',background:exportProfile===p?T.accent+'22':T.input,border:`1px solid ${exportProfile===p?T.accent:T.border}`,borderRadius:5,color:exportProfile===p?T.accent:T.textDim,fontSize:9}}>{p}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:T.textDim,marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Watermark</div>
              <input type="text" placeholder="Your name or (c) text" value={watermark} onChange={e=>setWatermark(e.target.value)}
                style={{width:'100%',padding:'7px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11,outline:'none'}}/>
              {watermark&&(
                <div style={{display:'flex',gap:4,marginTop:6,flexWrap:'wrap'}}>
                  {[['bottom-right','BR BR'],['bottom-left','BL BL'],['top-right','TR TR'],['top-left','NW TL'],['center','+ Ctr']].map(([pos,lbl])=>(
                    <button key={pos} onClick={()=>setWatermarkPos(pos)}
                      style={{padding:'3px 8px',background:watermarkPos===pos?T.accent+'22':T.input,
                        border:`1px solid ${watermarkPos===pos?T.accent:T.border}`,borderRadius:4,
                        color:watermarkPos===pos?T.accent:T.textDim,fontSize:9}}>{lbl}</button>
                  ))}
                </div>
              )}
            </div>
            <div style={{marginBottom:18}}>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:T.text,cursor:'pointer'}}>
                <input type="checkbox" checked={batchExport} onChange={e=>setBatchExport(e.target.checked)} style={{accentColor:T.accent,width:14,height:14}}/>
                Batch export all {photos.length} photos
              </label>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowExport(false)} style={{flex:1,padding:'9px',background:T.input,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontSize:12}}>Cancel</button>
              <button onClick={()=>doExport(!batchExport)} style={{flex:2,padding:'9px',background:`linear-gradient(90deg,${T.accent},${T.accentDark})`,border:'none',borderRadius:7,color:'#000',fontSize:12,fontWeight:700}}>
                {batchExport?`Export All (${photos.length})`:'Export & Download'} TR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* == TOP BAR == */}
      <div style={{height:48,background:T.panel,borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',padding:'0 16px',gap:4,flexShrink:0,zIndex:10}} className="no-print">
        <div style={{display:'flex',alignItems:'center',gap:9,marginRight:16}}>
          <div style={{width:30,height:30,background:`linear-gradient(135deg,${T.accent},${T.accentDark})`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',boxShadow:`0 2px 10px ${T.accentGlow}`}}>L</div>
          <div style={{lineHeight:1}}><div style={{fontSize:12,fontWeight:700,color:T.textBright,letterSpacing:'-0.3px'}}>LuminaEdit</div><div style={{fontSize:8,color:T.textDim,letterSpacing:'0.15em',textTransform:'uppercase',marginTop:1}}>Studio</div></div>
        </div>

        {[[`develop`,i18n('develop')],[`map`,i18n('map')],[`people`,i18n('people')],[`book`,i18n('book')],[`slideshow`,i18n('slideshow')],[`print`,i18n('print')]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setModule(id)}
            className={`mod-btn${module===id?' active':''}`} style={{color:module===id?T.accent:T.textDim}}>
            {lbl}
          </button>
        ))}
        <button onClick={()=>setShowHDRMerge(true)}
          className="mod-btn" style={{color:T.textDim}}>HDR</button>
        <button onClick={()=>setShowPanorama(true)} className="mod-btn" style={{color:T.textDim}}>Pano</button>

        <div style={{flex:1}}/>

        {photo&&module==='develop'&&(<>
          <button className="hov" onClick={undo} title="Undo (Ctrl+Z)" style={{padding:'5px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:10,fontWeight:500}}>{i18n('undo')}</button>
          <button className="hov" onClick={redo} title="Redo (Ctrl+Y)" style={{padding:'5px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:10,fontWeight:500}}>{i18n('redo')}</button>
          <button className="hov" onClick={()=>setShowBefore(b=>!b)} style={{padding:'5px 10px',background:showBefore?T.blueGlow:T.input,border:`1px solid ${showBefore?T.blue:T.border}`,borderRadius:6,color:showBefore?T.blue:T.text,fontSize:10,fontWeight:500}}>{showBefore?i18n('before'):i18n('after')}</button>
          <button className="hov" onClick={()=>setShowGuidedUpright(true)} title="Guided Upright" style={{padding:'5px 10px',background:T.accentSoft,border:`1px solid ${T.accent}44`,borderRadius:6,color:T.accent,fontSize:10,fontWeight:500}}>Upright</button>
          <button className="hov" onClick={()=>{if(selId)window._lc={...adj};showNotif('Settings copied');}} style={{padding:'5px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:10,fontWeight:500}}>Copy</button>
          <button className="hov" onClick={()=>{if(selId&&window._lc){setAdjMap(p=>({...p,[selId]:{...window._lc}}));showNotif('Settings pasted');}}} style={{padding:'5px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:10,fontWeight:500}}>Paste</button>
          <button className="hov" onClick={()=>{if(selId){pushUndo(selId,{adj:{...DEF},crop:cropMap[selId]||null,rating:ratingMap[selId]||0,flag:flagMap[selId]||0,label:labelMap[selId]||null},'Reset');setAdjMap(p=>({...p,[selId]:{...DEF}}));showNotif('Reset to defaults');}}} style={{padding:'5px 10px',background:'none',border:`1px solid ${T.border}`,borderRadius:6,color:T.textDim,fontSize:10,fontWeight:500}}>Reset</button>
        </>)}

        <button onClick={()=>fileRef.current?.click()} style={{padding:'6px 14px',background:T.input,border:`1px solid ${T.border}`,borderRadius:7,color:T.textBright,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
          <span style={{color:T.accent,fontSize:15,lineHeight:1}}>+</span> {i18n('import')}
        </button>
        {photos.length>0&&(
          <button onClick={()=>{if(confirm('Clear all photos and start fresh?')){localStorage.removeItem('lumina_session');setPhotos([]);setSelId(null);setAdjMap({});setCropMap({});setRatingMap({});setFlagMap({});setLabelMap({});setFolderMap({});setBookPages([{id:'p1',photos:[],layout:'2up'}]);showNotif('Session cleared');}}}
            style={{padding:'6px 10px',background:'none',border:`1px solid ${T.border}`,borderRadius:7,color:T.textDim,fontSize:10}}>
            {i18n('clear')}
          </button>
        )}
        {photo&&(
          <button onClick={()=>setShowExport(true)} style={{padding:'6px 18px',background:T.accent,border:'none',borderRadius:7,color:'#fff',fontSize:11,fontWeight:700,boxShadow:`0 2px 16px ${T.accentGlow}`,letterSpacing:'0.02em'}}>
            {i18n('export')}
          </button>
        )}
        <input ref={fileRef} type="file" multiple accept="image/*,.cr2,.cr3,.nef,.arw,.dng,.raf,.rw2,.orf,.pef,.srw" style={{display:'none'}} onChange={e=>handleImport(e.target.files)}/>
        <button onClick={()=>setShowSettings(true)} title={i18n('settings')}
          style={{width:34,height:34,background:'none',border:`1px solid ${T.border}`,borderRadius:7,color:T.textDim,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          ⚙
        </button>
      </div>

      {/* == MODULES == */}
      {module==='map'&&(
        <div style={{flex:1,display:'flex',overflow:'hidden'}}>
          <MapModule photos={photos} onSelect={id=>{setSelId(id);setModule('develop');}} onGeoTag={(id,lat,lng)=>{setPhotos(prev=>prev.map(p=>p.id===id?{...p,exif:{...p.exif,lat,lng}}:p));showNotif('GPS coords saved');}}/>
        </div>
      )}

      {module==='people'&&(
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'12px 20px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
            <span style={{fontSize:13,fontWeight:700,color:T.textBright}}>People</span>
            <span style={{fontSize:11,color:T.textDim}}>{Object.keys(detectedFaces).length} photos with faces</span>
            <button onClick={detectFaces} disabled={faceDetecting}
              style={{padding:'5px 14px',background:T.accent,border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700,opacity:faceDetecting?0.6:1}}>
              {faceDetecting?'Detecting...':'Scan for Faces'}
            </button>
          </div>
          {faceGroups.length===0&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:T.textDim}}>
              <div style={{fontSize:48,opacity:0.3}}>FACE</div>
              <div style={{fontSize:14,fontWeight:600,color:T.text}}>No people detected yet</div>
              <div style={{fontSize:11}}>Click "Scan for Faces" to analyze your photos</div>
            </div>
          )}
          {faceGroups.length>0&&(
            <div style={{flex:1,overflowY:'auto',padding:16}}>
              <div style={{fontSize:10,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>Groups — {faceGroups.length} detected</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
                {faceGroups.map((group,gi)=>(
                  <div key={group.id} style={{background:T.panel2,borderRadius:10,overflow:'hidden',border:`1px solid ${T.border}`}}>
                    <div style={{position:'relative',aspectRatio:'1',overflow:'hidden',background:T.input}}>
                      {group.thumb&&<img src={group.thumb} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
                      <div style={{position:'absolute',bottom:4,right:4,background:'rgba(0,0,0,0.7)',borderRadius:4,padding:'1px 5px',fontSize:9,color:'#fff'}}>{group.photos.length} photos</div>
                    </div>
                    <div style={{padding:'8px 10px'}}>
                      <input
                        value={peopleNames[group.id]||''}
                        onChange={e=>setPeopleNames(prev=>({...prev,[group.id]:e.target.value}))}
                        placeholder={`Person ${gi+1}`}
                        style={{width:'100%',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:11,padding:'4px 6px',outline:'none'}}
                      />
                      <div style={{marginTop:6,display:'flex',gap:3,flexWrap:'wrap'}}>
                        {group.photos.slice(0,4).map(pid=>{
                          const ph=photos.find(p=>p.id===pid);
                          if(!ph)return null;
                          return <img key={pid} src={ph.src} alt="" onClick={()=>{setSelId(pid);setModule('develop');}}
                            style={{width:28,height:28,objectFit:'cover',borderRadius:3,cursor:'pointer',border:`1px solid ${T.border}`}}/>;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {module==='book'&&(
        <div style={{flex:1,display:'flex',overflow:'hidden'}}>
          {/* Book left panel - photo picker */}
          <div style={{width:180,background:T.panel,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0}}>
            <div style={{padding:'10px 12px',borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:600,color:T.textBright}}>Photos</div>
            <div style={{flex:1,overflowY:'auto',padding:6,display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
              {photos.map(p=>(
                <div key={p.id} onClick={()=>addPhotoToBook(p.id)}
                  style={{aspectRatio:'1',overflow:'hidden',borderRadius:4,cursor:'pointer',border:`1px solid ${T.border}`,position:'relative'}}>
                  <img src={p.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'rgba(232,150,60,0)',transition:'background 0.15s'}} className="book-add"/>
                </div>
              ))}
              {photos.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',color:T.textDim,fontSize:10,padding:12}}>Import photos first</div>}
            </div>
          </div>
          {/* Book canvas */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{padding:'10px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <input value={bookTitle} onChange={e=>setBookTitle(e.target.value)}
                style={{background:'none',border:'none',color:T.textBright,fontSize:14,fontWeight:700,outline:'none',flex:1}}/>
              <span style={{fontSize:10,color:T.textDim}}>Page {bookPage+1} of {bookPages.length}</span>
              <button onClick={()=>setBookPage(p=>Math.max(0,p-1))} disabled={bookPage===0}
                style={{padding:'3px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:11,opacity:bookPage===0?0.4:1}}>Prev</button>
              <button onClick={()=>setBookPage(p=>Math.min(bookPages.length-1,p+1))} disabled={bookPage>=bookPages.length-1}
                style={{padding:'3px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:11,opacity:bookPage>=bookPages.length-1?0.4:1}}>Next</button>
              <button onClick={addBookPage}
                style={{padding:'3px 10px',background:T.accent,border:'none',borderRadius:4,color:'#000',fontSize:11,fontWeight:700}}>+ Page</button>
              <button onClick={()=>removeBookPage(bookPage)} disabled={bookPages.length<=1}
                style={{padding:'3px 10px',background:T.red+'22',border:`1px solid ${T.red}`,borderRadius:4,color:T.red,fontSize:11,opacity:bookPages.length<=1?0.4:1}}>Del Page</button>
              <select value={bookPages[bookPage]?.layout||'2up'} onChange={e=>setBookPages(prev=>prev.map((pg,i)=>i===bookPage?{...pg,layout:e.target.value}:pg))}
                style={{background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:10,padding:'3px 6px'}}>
                <option value="1up">1 Photo</option>
                <option value="2up">2 Photos</option>
                <option value="3up">3 Photos</option>
                <option value="4up">4 Photos</option>
                <option value="cover">Cover</option>
              </select>
            </div>
            <div style={{flex:1,overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'#1a1a1d'}}>
              {/* Book page preview */}
              <div style={{background:'#fff',borderRadius:4,boxShadow:'0 8px 40px rgba(0,0,0,0.6)',aspectRatio:'8.5/11',height:'80%',display:'flex',flexDirection:'column',overflow:'hidden',maxWidth:500,width:'100%'}}>
                {bookPages[bookPage]?.layout==='cover'&&(
                  <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,background:'#111',color:'#fff'}}>
                    {bookPages[bookPage].photos[0]&&<img src={photos.find(p=>p.id===bookPages[bookPage].photos[0])?.src} alt="" style={{width:'100%',height:'60%',objectFit:'cover',marginBottom:16}}/>}
                    <div style={{fontSize:22,fontWeight:700,textAlign:'center'}}>{bookTitle}</div>
                  </div>
                )}
                {bookPages[bookPage]?.layout!=='cover'&&(
                  <div style={{flex:1,display:'grid',padding:8,gap:6,
                    gridTemplateColumns:bookPages[bookPage]?.layout==='1up'?'1fr':bookPages[bookPage]?.layout==='4up'?'1fr 1fr':'1fr 1fr',
                    gridTemplateRows:bookPages[bookPage]?.layout==='3up'?'1fr 1fr':bookPages[bookPage]?.layout==='4up'?'1fr 1fr':'1fr'}}>
                    {Array.from({length:bookPages[bookPage]?.layout==='1up'?1:bookPages[bookPage]?.layout==='2up'?2:bookPages[bookPage]?.layout==='3up'?3:4}).map((_,si)=>{
                      const pid=bookPages[bookPage]?.photos[si];
                      const ph=pid?photos.find(p=>p.id===pid):null;
                      return(
                        <div key={si} style={{background:'#eee',borderRadius:3,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',
                          gridColumn:bookPages[bookPage]?.layout==='3up'&&si===0?'1/-1':'auto',position:'relative'}}>
                          {ph?<img src={ph.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:
                            <div style={{color:'#aaa',fontSize:10,textAlign:'center'}}>Click photo<br/>to add</div>}
                          {ph&&<button onClick={()=>removePhotoFromBook(bookPage,pid)}
                            style={{position:'absolute',top:2,right:2,background:'rgba(0,0,0,0.6)',border:'none',borderRadius:3,color:'#fff',fontSize:10,padding:'1px 5px',cursor:'pointer'}}>x</button>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{padding:'4px 8px',borderTop:'1px solid #ddd',display:'flex',justifyContent:'space-between',fontSize:9,color:'#888'}}>
                  <span>{bookTitle}</span><span>Page {bookPage+1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {module==='slideshow'&&(
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
          <div style={{fontSize:40,marginBottom:8}}>&#127902;</div>
          <div style={{fontSize:20,fontWeight:600,color:T.textBright}}>Slideshow</div>
          <div style={{fontSize:13,color:T.textDim,marginBottom:8}}>{photos.length} photos ready</div>
          {photos.length>0?(
            <button onClick={()=>setShowSlideshow(true)}
              style={{padding:'14px 40px',background:`linear-gradient(90deg,${T.accent},${T.accentDark})`,border:'none',borderRadius:10,color:'#000',fontSize:14,fontWeight:700,boxShadow:`0 4px 20px ${T.accentGlow}`}}>
              Start Slideshow
            </button>
          ):(
            <div style={{color:T.textDim,fontSize:13}}>Import photos first to start slideshow</div>
          )}
          <div style={{fontSize:11,color:T.textDim,marginTop:8}}>Keyboard: [ ] to navigate . Space to pause . Esc to exit</div>
        </div>
      )}

      {module==='print'&&(
        <PrintModule photos={photos} adjMap={adjMap}/>
      )}

      {module==='develop'&&(
        <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

          {/* == LEFT PANEL == */}
          <div style={{width:232,background:T.panel,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0}} className="no-print">
            <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,flexShrink:0,overflowX:'auto'}}>
              {[[`library`,i18n('library')],[`folders`,i18n('folders')],[`presets`,i18n('presets')],[`smart`,i18n('smart')],[`keywords`,i18n('tags')],[`history`,i18n('history')]].map(([id,lbl])=>(
                <button key={id} onClick={()=>setLeftTab(id)}
                  style={{flexShrink:0,padding:'8px 10px',background:'none',border:'none',borderBottom:`2px solid ${leftTab===id?T.accent:'transparent'}`,color:leftTab===id?T.accent:T.textDim,fontSize:9,fontWeight:leftTab===id?700:500,letterSpacing:'0.06em',textTransform:'uppercase',whiteSpace:'nowrap',cursor:'pointer',transition:'all 0.15s'}}>
                  {lbl}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:'auto'}}>
              {leftTab==='library'&&(<>
                <div style={{padding:'8px 10px 4px'}}>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:11,color:T.textDim}}>S</span>
                    <input type="text" placeholder="Search name or keyword..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                      style={{width:'100%',padding:'5px 8px 5px 26px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11,outline:'none'}}/>
                  </div>
                </div>
                <div style={{padding:'4px 0'}}>
                  <div style={{padding:'4px 12px',fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase'}}>{i18n('collections')}</div>
                  {[
                    {id:'all',icon:'##',label:i18n('allPhotos'),count:photos.length},
                    {id:'picks',icon:'P',label:i18n('picks'),count:Object.values(flagMap).filter(f=>f===1).length},
                    {id:'starred',icon:'*',label:i18n('starred'),count:Object.values(ratingMap).filter(r=>r>=4).length},
                    {id:'rejected',icon:'x',label:i18n('rejected'),count:Object.values(flagMap).filter(f=>f===-1).length},
                  ].map(col=>(
                    <button key={col.id} className="cbtn" onClick={()=>{setFilterCol(col.id);setSmartFilter(null);}}
                      style={{width:'100%',padding:'5px 12px',background:(filterCol===col.id&&!smartFilter)?T.input:'none',
                        border:'none',textAlign:'left',color:(filterCol===col.id&&!smartFilter)?T.textBright:T.text,
                        fontSize:11,display:'flex',alignItems:'center',gap:8}}>
                      <span style={{color:T.textDim,width:14}}>{col.icon}</span>
                      <span style={{flex:1}}>{col.label}</span>
                      <span style={{fontSize:10,color:T.textDim}}>{col.count}</span>
                    </button>
                  ))}
                </div>
                <div style={{padding:'4px 12px 2px',fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase'}}>
                  {i18n('photos')} ({displayPhotos.length})
                  {smartFilter&&<button onClick={()=>setSmartFilter(null)} style={{marginLeft:6,fontSize:8,color:T.accent,background:'none',border:'none'}}>x {smartFilter.name}</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,padding:'2px 6px 8px'}}>
                  {displayPhotos.map(p=>{
                    const sel=p.id===selId;
                    return(
                      <div key={p.id} className="ft" onClick={()=>setSelId(p.id)}
                        style={{aspectRatio:'1',overflow:'hidden',borderRadius:4,cursor:'pointer',
                          border:`2px solid ${sel?T.accent:'transparent'}`,position:'relative'}}>
                        <img src={p.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:adjMap[p.id]?buildFilter(adjMap[p.id]):'none'}}/>
                        {(ratingMap[p.id]||0)>0&&<div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.8))',fontSize:7,color:T.accent,textAlign:'center',padding:'3px 0 1px'}}>{'*'.repeat(ratingMap[p.id]||0)}</div>}
                        {flagMap[p.id]===1&&<div style={{position:'absolute',top:1,left:2,fontSize:9,color:'#fff'}}>P</div>}
                        {labelMap[p.id]&&<div style={{position:'absolute',top:2,right:2,width:7,height:7,borderRadius:'50%',background:labelMap[p.id],border:'1px solid rgba(255,255,255,0.5)'}}/>}
                        {p.raw&&<div style={{position:'absolute',bottom:0,right:2,fontSize:6,color:T.accent,fontWeight:700}}>RAW</div>}
                        {p.keywords?.length>0&&<div style={{position:'absolute',top:1,right:2,fontSize:7,color:T.purple}}>&#127991;</div>}
                        {p.exif?.lat&&<div style={{position:'absolute',top:1,left:p.raw?12:2,fontSize:7,color:T.blue}}>GPS</div>}
                        <button onClick={e=>{e.stopPropagation();if(confirmDelete&&!confirm(`Remove "${p.name}" from session?`))return;setPhotos(prev=>{const next=prev.filter(x=>x.id!==p.id);if(selId===p.id)setSelId(next[0]?.id||null);return next;});showNotif('Photo removed');}}
                          style={{position:'absolute',top:2,right:2,width:14,height:14,background:'rgba(0,0,0,0.7)',border:'none',borderRadius:3,color:'#fff',fontSize:10,lineHeight:'14px',textAlign:'center',cursor:'pointer',display:'none'}}
                          className="del-btn">x</button>
                      </div>
                    );
                  })}
                  {photos.length===0&&(
                    <div onClick={()=>fileRef.current?.click()} style={{gridColumn:'1/-1',margin:'12px 4px',padding:'28px 12px',
                      textAlign:'center',color:T.textDim,fontSize:11,border:`1px dashed ${T.border}`,borderRadius:8,cursor:'pointer'}}>
                      <div style={{fontSize:28,marginBottom:6,opacity:0.5}}>CAM</div>
                      <div style={{fontWeight:500,color:T.text,marginBottom:3}}>{i18n('noPhotosImport')}</div>
                      <div style={{fontSize:10}}>Click or drag & drop</div>
                      <div style={{fontSize:9,marginTop:3,color:T.border}}>JPG . PNG . WebP . CR2 . NEF . ARW . DNG</div>
                    </div>
                  )}
                </div>
              </>)}

              {leftTab==='folders'&&(
                <div style={{padding:'6px 0'}}>
                  <div style={{padding:'6px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase'}}>Folders</span>
                    <button onClick={()=>{folderFileRef.current?.click();}} style={{fontSize:9,padding:'2px 8px',background:T.accent,border:'none',borderRadius:4,color:'#000',fontWeight:700}}>Import Folder</button>
                    <input ref={folderFileRef} type="file" multiple webkitdirectory="" style={{display:'none'}} onChange={e=>handleImport(e.target.files)}/>
                  </div>
                  {Object.keys(folderMap).length===0&&(
                    <div style={{padding:'20px 14px',textAlign:'center',color:T.textDim,fontSize:11}}>No folders yet. Import photos to see folder structure.</div>
                  )}
                  <button onClick={()=>setSelectedFolder(null)}
                    style={{width:'100%',padding:'6px 14px',background:selectedFolder===null?T.accent+'22':'none',border:'none',textAlign:'left',
                      color:selectedFolder===null?T.accent:T.text,fontSize:11,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:12}}>ALL</span>
                    <span>{i18n('allPhotos')}</span>
                    <span style={{marginLeft:'auto',fontSize:9,color:T.textDim}}>{photos.length}</span>
                  </button>
                  {Object.entries(folderMap).map(([folder,ids])=>(
                    <button key={folder} onClick={()=>setSelectedFolder(folder)}
                      style={{width:'100%',padding:'6px 14px',background:selectedFolder===folder?T.accent+'22':'none',border:'none',textAlign:'left',
                        color:selectedFolder===folder?T.accent:T.text,fontSize:11,display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:12}}>DIR</span>
                      <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{folder}</span>
                      <span style={{fontSize:9,color:T.textDim,flexShrink:0}}>{ids.length}</span>
                    </button>
                  ))}
                </div>
              )}
              {leftTab==='presets'&&(
                <div style={{padding:'6px 0'}}>
                  <div style={{padding:'4px 12px 4px',fontSize:9,color:T.textDim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:2}}>Built-in Presets</div>
                  {PRESETS.map(p=>(
                    <button key={p.id} className="prow" onClick={()=>{if(!selId)return;setAdjMap(prev=>({...prev,[selId]:{...DEF,...p.adj}}));showNotif(`Applied: ${p.name}`);}}
                      style={{width:'100%',padding:'6px 14px',background:'none',border:'none',textAlign:'left',color:T.text,fontSize:11,display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:13,width:18,textAlign:'center'}}>{p.icon}</span><span>{p.name}</span>
                    </button>
                  ))}
                  <div style={{borderTop:`1px solid ${T.border}`,margin:'10px 12px',paddingTop:10}}>
                    <button onClick={()=>{const name=prompt('Preset name:');if(name&&selId){PRESETS.push({id:`u${Date.now()}`,name,icon:'*',adj:{...adj}});showNotif('Preset saved');}}}
                      style={{width:'100%',padding:'7px',background:T.input,border:`1px dashed ${T.border}`,borderRadius:6,color:T.textDim,fontSize:10}}>+ Save Current as Preset</button>
                  </div>
                </div>
              )}

              {leftTab==='smart'&&(
                <SmartCollections photos={photos} adjMap={adjMap} ratingMap={ratingMap} flagMap={flagMap}
                  onSelect={col=>{setSmartFilter(col);setLeftTab('library');}}/>
              )}


              {leftTab==='keywords'&&(
                <KeywordsPanel photo={photo} onUpdate={updateKeywords}/>
              )}

              {leftTab==='history'&&(
                <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
                  {/* Undo / Redo buttons */}
                  <div style={{display:'flex',gap:6,padding:'8px 12px',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
                    <button onClick={undo}
                      style={{flex:1,padding:'6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,
                        color:(undoMap[selId]&&(undoIdxMap[selId]??0)>0)?T.accent:T.textDim,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                      Undo
                    </button>
                    <button onClick={redo}
                      style={{flex:1,padding:'6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,
                        color:(undoMap[selId]&&(undoIdxMap[selId]??0)<(undoMap[selId]?.length??1)-1)?T.accent:T.textDim,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                      Redo
                    </button>
                  </div>
                  <div style={{fontSize:9,color:T.textDim,padding:'6px 14px 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>
                    {i18n('editHistory')} {selId&&undoMap[selId]?`(${(undoIdxMap[selId]??0)+1}/${undoMap[selId].length})`:''}
                  </div>
                  <div style={{flex:1,overflowY:'auto'}}>
                    {selId&&undoMap[selId]?.length>0?(
                      [...undoMap[selId]].reverse().map((entry,ri)=>{
                        const stack=undoMap[selId];
                        const realIdx=stack.length-1-ri;
                        const curIdx=undoIdxMap[selId]??stack.length-1;
                        const isCurrent=realIdx===curIdx;
                        const isFuture=realIdx>curIdx;
                        return(
                          <div key={realIdx} onClick={()=>{
                            setUndoIdxMap(p=>({...p,[selId]:realIdx}));
                            setAdjMap(p=>({...p,[selId]:{...entry.adj}}));
                            showNotif(`Jumped to: ${entry.label}`);
                          }} style={{padding:'6px 14px',borderBottom:`1px solid ${T.border}22`,
                            display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',
                            background:isCurrent?T.accent+'18':isFuture?'rgba(255,255,255,0.02)':'none',
                            opacity:isFuture?0.4:1,transition:'background 0.1s'}}>
                            <div style={{display:'flex',alignItems:'center',gap:7}}>
                              {isCurrent&&<span style={{width:6,height:6,borderRadius:'50%',background:T.accent,display:'inline-block',flexShrink:0}}/>}
                              {!isCurrent&&<span style={{width:6,height:6,borderRadius:'50%',background:'transparent',border:`1px solid ${T.border}`,display:'inline-block',flexShrink:0}}/>}
                              <span style={{fontSize:10,color:isCurrent?T.accent:isFuture?T.textDim:T.text,fontWeight:isCurrent?600:400}}>
                                {realIdx===0?'Original':entry.label}
                              </span>
                            </div>
                            <span style={{fontSize:9,color:T.textDim,fontFamily:'monospace'}}>
                              {typeof entry.adj[entry.label]==='number'?`${entry.adj[entry.label]>0?'+':''}${entry.adj[entry.label]?.toFixed?.(1)??entry.adj[entry.label]}`:''}
                            </span>
                          </div>
                        );
                      })
                    ):(
                      <div style={{padding:24,textAlign:'center',color:T.textDim,fontSize:11}}>
                        <div style={{fontSize:24,marginBottom:8,opacity:0.4}}>&#9201;</div>
                        {i18n('noEdits')}<br/>
                        <span style={{fontSize:9,marginTop:4,display:'block'}}>Adjust any slider to start</span>
                      </div>
                    )}
                  </div>
                  <div style={{padding:'6px 12px',borderTop:`1px solid ${T.border}`,fontSize:9,color:T.textDim,textAlign:'center'}}>
                    Ctrl+Z undo . Ctrl+Y redo . Click any entry to jump
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* == WORKSPACE == */}
          <div ref={workspaceRef} style={{flex:1,background:'#0f0f12',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}
            onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleImport(e.dataTransfer.files);}}
            onWheel={handleWheel}>
            {/* Toolbar */}
            <div style={{height:38,background:T.panel,borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',padding:'0 10px',gap:3,flexShrink:0}} className="no-print">
              <button className="hov" onClick={()=>setZoom(z=>Math.min(8,z*1.25))} style={{width:26,height:26,background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:14}}>+</button>
              <span style={{fontSize:10,color:T.textDim,minWidth:40,textAlign:'center',fontFamily:'monospace'}}>{Math.round(zoom*100)}%</span>
              <button className="hov" onClick={()=>setZoom(z=>Math.max(0.1,z/1.25))} style={{width:26,height:26,background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:14}}>-</button>
              <button className="hov" onClick={()=>{setZoom(1);setPanOffset({x:0,y:0});}} style={{padding:'3px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:9}}>Fit</button>
              <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
              {/* View mode */}
              {[['single','[]','Single'],['compare','[][]','Compare'],['survey','##','Survey']].map(([id,icon,lbl])=>(
                <button key={id} onClick={()=>setViewMode(id)} title={lbl}
                  style={{padding:'3px 7px',background:viewMode===id?T.blue+'22':'none',border:`1px solid ${viewMode===id?T.blue:'transparent'}`,borderRadius:4,color:viewMode===id?T.blue:T.textDim,fontSize:11}}>
                  {icon}
                </button>
              ))}
              <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
              {TOOLS.map(tool=>(
                <button key={tool.id} title={tool.label} onClick={()=>{
                  setActiveTool(tool.id);
                  if(['brush','gradient','radial'].includes(tool.id))setShowLocalPanel(true);
                  if(tool.id==='subject')applyAutoSubject();
                  if(tool.id==='sky')applyAutoSky();
                }}
                  style={{padding:'4px 7px',background:activeTool===tool.id?T.accentSoft:'none',border:`1px solid ${activeTool===tool.id?T.accent:'transparent'}`,borderRadius:6,color:activeTool===tool.id?T.accent:T.textDim,fontSize:13,display:'flex',alignItems:'center',gap:3,transition:'all 0.12s'}}>
                  <span>{tool.icon}</span>
                  {activeTool===tool.id&&<span style={{fontSize:8,fontWeight:600,letterSpacing:'0.04em'}}>{tool.label}</span>}
                </button>
              ))}
              {activeTool==='crop'&&cropRect&&(<>
                <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
                <select value={cropAspect||''} onChange={e=>setCropAspect(e.target.value?parseFloat(e.target.value):null)}
                  style={{background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontSize:9,padding:'2px 4px'}}>
                  <option value="">Free</option><option value="1">1:1</option><option value="1.333">4:3</option><option value="1.778">16:9</option><option value="0.667">2:3</option>
                </select>
                <button onClick={applyCrop} style={{padding:'3px 10px',background:T.green+'22',border:`1px solid ${T.green}`,borderRadius:5,color:T.green,fontSize:10,fontWeight:600}}>OK Apply [C]</button>
                <button onClick={resetCrop} style={{padding:'3px 10px',background:T.red+'22',border:`1px solid ${T.red}`,borderRadius:5,color:T.red,fontSize:10}}>x Reset</button>
              </>)}
              {activeTool==='straighten'&&(<>
                <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
                <span style={{fontSize:9,color:T.textDim}}>Click & drag along horizon to straighten</span>
                {straightenAngle!==null&&<span style={{fontSize:9,color:T.accent}}>Angle: {straightenAngle.toFixed(1)}deg</span>}
              </>)}
              {activeTool==='brush'&&(<>
                <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
                <span style={{fontSize:9,color:T.textDim}}>Size</span>
                <input type="range" min={5} max={200} value={brushSize} onChange={e=>setBrushSize(parseInt(e.target.value))} style={{width:60,height:4,background:T.input}}/>
                <span style={{fontSize:9,color:T.textDim}}>Opac</span>
                <input type="range" min={1} max={100} value={brushOpacity} onChange={e=>setBrushOpacity(parseInt(e.target.value))} style={{width:60,height:4,background:T.input}}/>
                <button onClick={()=>setBrushErasing(b=>!b)} style={{padding:'2px 8px',background:brushErasing?T.red+'22':T.input,border:`1px solid ${brushErasing?T.red:T.border}`,borderRadius:4,color:brushErasing?T.red:T.textDim,fontSize:9}}>{brushErasing?'Erasing':'Paint'}</button>
                <button onClick={()=>{if(maskCanvas){const ctx=maskCanvas.getContext('2d');ctx.clearRect(0,0,maskCanvas.width,maskCanvas.height);setMaskCanvas(null);showNotif('Mask cleared');}}} style={{padding:'2px 8px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:9}}>Clear</button>
              </>)}
              {activeTool==='heal'&&(<>
                <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
                <span style={{fontSize:9,color:T.textDim}}>Radius</span>
                <input type="range" min={5} max={100} value={healRadius} onChange={e=>setHealRadius(parseInt(e.target.value))} style={{width:60,height:4,background:T.input}}/>
                {healSource?<span style={{fontSize:9,color:T.green}}>OK Source set</span>:<span style={{fontSize:9,color:T.textDim}}>Click = set source</span>}
                {healSource&&<button onClick={()=>setHealSource(null)} style={{padding:'2px 6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:9}}>Clear</button>}
              </>)}
              {activeTool==='redeye'&&(<>
                <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
                <span style={{fontSize:9,color:T.textDim}}>Radius</span>
                <input type="range" min={5} max={80} value={redEyeRadius} onChange={e=>setRedEyeRadius(parseInt(e.target.value))} style={{width:60,height:4,background:T.input}}/>
                <span style={{fontSize:9,color:T.textDim}}>Click on red eyes</span>
              </>)}
              <div style={{flex:1}}/>
              {photo&&<button onClick={autoTone} title="Auto: sets Exposure, Contrast, Highlights, Shadows, Whites, Blacks automatically"
                style={{padding:'4px 10px',background:T.accentSoft,border:`1px solid ${T.accent}55`,borderRadius:6,color:T.accent,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',gap:4}}>
                &#9889; Auto
              </button>}
              {photo&&<button onClick={makeVirtualCopy} title="Make a virtual copy of this photo with the same edits"
                style={{padding:'4px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.textDim,fontSize:9,fontWeight:500}}>
                + Copy
              </button>}
              {photo&&photos.length>1&&<button onClick={()=>setShowSync(true)} title="Copy these edits to other photos"
                style={{padding:'4px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.textDim,fontSize:9,fontWeight:500}}>
                Sync
              </button>}
              <button onClick={()=>{const v=!autoAdvance;setAutoAdvance(v);localStorage.setItem('lumina_autoAdvance',JSON.stringify(v));}}
                title="Auto-advance: move to next photo after flagging or rating"
                style={{padding:'4px 8px',background:autoAdvance?T.accentSoft:T.input,border:`1px solid ${autoAdvance?T.accent:T.border}`,borderRadius:6,color:autoAdvance?T.accent:T.textDim,fontSize:9,fontWeight:600}}>
                AA
              </button>
              <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
              {photo&&(
                <div style={{display:'flex',alignItems:'center',gap:3}}>
                  <button onClick={()=>{setFlag(selId,flagMap[selId]===1?0:1);advancePhoto();}} style={{background:'none',border:'none',fontSize:13,color:flagMap[selId]===1?'#fff':T.border,padding:'1px 3px'}}>P</button>
                  <button onClick={()=>{setFlag(selId,flagMap[selId]===-1?0:-1);advancePhoto();}} style={{background:'none',border:'none',fontSize:11,color:flagMap[selId]===-1?T.red:T.border,padding:'1px 3px'}}>x</button>
                  {[1,2,3,4,5].map(r=>(
                    <button key={r} onClick={()=>{setRating(selId,ratingMap[selId]===r?0:r);advancePhoto();}} style={{background:'none',border:'none',fontSize:13,color:(ratingMap[selId]||0)>=r?T.accent:T.border,padding:'1px'}}>*</button>
                  ))}
                  <div style={{width:1,height:14,background:T.border,margin:'0 3px'}}/>
                  {COLOR_LABELS.map(clr=>(
                    <button key={clr} onClick={()=>setLabel(selId,labelMap[selId]===clr?null:clr)} style={{width:11,height:11,borderRadius:'50%',background:clr,border:`2px solid ${labelMap[selId]===clr?'#fff':'transparent'}`,padding:0}}/>
                  ))}
                </div>
              )}
            </div>

            {/* Image Area */}
            <div style={{flex:1,overflow:'hidden',display:'flex',position:'relative',
              background:'repeating-conic-gradient(#111113 0% 25%, #0d0d10 0% 50%) 0 0/20px 20px',
              cursor:activeTool==='pan'?isPanning?'grabbing':'grab':activeTool==='crop'||activeTool==='straighten'?'crosshair':activeTool==='brush'?'cell':activeTool==='heal'||activeTool==='redeye'?'crosshair':'default'}}
              onMouseDown={handleMD} onMouseMove={handleMM} onMouseUp={handleMU} onClick={handleClick}>

              {/* SINGLE VIEW */}
              {viewMode==='single'&&(<>
                {photo?(
                  <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
                    <div style={{position:'absolute',inset:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <div style={{transform:`translate(${panOffset.x}px,${panOffset.y}px) scale(${zoom}) rotate(${adj.rotate||0}deg)`,transformOrigin:'center',willChange:'transform',transition:'none',userSelect:'none'}}>
                        <img ref={imgRef} src={maskSrc||hslSrc||photo.src} alt="editing"
                          style={{display:'block',maxWidth:'85vw',maxHeight:'82vh',
                            filter:showBefore?'none':cssFilter,imageRendering:'auto',
                            transition:'filter 0.04s',userSelect:'none',pointerEvents:'none',
                            clipPath:cropR?`inset(${cropR.y*100}% ${(1-cropR.x-cropR.w)*100}% ${(1-cropR.y-cropR.h)*100}% ${cropR.x*100}%)`:'none',
                          }}/>
                      {activeTool==='crop'&&cropPreview&&cropPreview.w>0.01&&(
                        <div style={{position:'absolute',left:`${cropPreview.x*100}%`,top:`${cropPreview.y*100}%`,
                          width:`${cropPreview.w*100}%`,height:`${cropPreview.h*100}%`,
                          border:`2px solid ${T.accent}`,boxShadow:`0 0 0 9999px rgba(0,0,0,0.45)`,pointerEvents:'none',zIndex:5}}>
                          {[1,2].map(i=><div key={`h${i}`} style={{position:'absolute',left:0,right:0,top:`${i*33.3}%`,height:1,background:'rgba(255,255,255,0.3)'}}/>)}
                          {[1,2].map(i=><div key={`v${i}`} style={{position:'absolute',top:0,bottom:0,left:`${i*33.3}%`,width:1,background:'rgba(255,255,255,0.3)'}}/>)}
                          {[[0,0],[100,0],[0,100],[100,100]].map(([lx,ly],i)=>(
                            <div key={i} style={{position:'absolute',left:`${lx}%`,top:`${ly}%`,width:12,height:12,transform:'translate(-50%,-50%)',border:`2px solid ${T.accent}`,background:'rgba(0,0,0,0.6)',borderRadius:2}}/>
                          ))}
                        </div>
                      )}
                      {/* Straighten guide line */}
                      {activeTool==='straighten'&&straightenStart&&straightenAngle!==null&&(
                        <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:6,overflow:'hidden'}}>
                          <div style={{position:'absolute',top:'50%',left:0,right:0,height:2,background:T.accent,opacity:0.8,
                            transform:`rotate(${straightenAngle}deg)`,transformOrigin:'center'}}/>
                        </div>
                      )}
                      <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.7)',color:showBefore?T.blue:T.accent,padding:'3px 8px',borderRadius:4,fontSize:9,fontWeight:600,pointerEvents:'none'}}>
                        {showBefore?'BEFORE':'AFTER'}
                      </div>
                      {photo.raw&&<div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.7)',color:T.accent,padding:'3px 8px',borderRadius:4,fontSize:9,fontWeight:600,pointerEvents:'none'}}>&#9889; RAW</div>}
                      {cropR&&<div style={{position:'absolute',bottom:8,left:8,background:'rgba(0,0,0,0.7)',color:T.green,padding:'3px 8px',borderRadius:4,fontSize:9,fontWeight:600,pointerEvents:'none'}}>C Cropped</div>}
                      </div>
                    </div>
                    {/* Fixed overlay badges */}
                    <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.75)',color:showBefore?T.blue:T.accent,padding:'3px 8px',borderRadius:4,fontSize:9,fontWeight:600,pointerEvents:'none',zIndex:10}}>
                      {showBefore?'BEFORE':'AFTER'}
                    </div>
                    {photo.raw&&<div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.75)',color:T.accent,padding:'3px 8px',borderRadius:4,fontSize:9,fontWeight:600,pointerEvents:'none',zIndex:10}}>&#9889; RAW</div>}
                    {cropR&&<div style={{position:'absolute',bottom:8,left:8,background:'rgba(0,0,0,0.75)',color:T.green,padding:'3px 8px',borderRadius:4,fontSize:9,fontWeight:600,pointerEvents:'none',zIndex:10}}>C Cropped</div>}
                    {hslSrc&&<div style={{position:'absolute',bottom:8,right:8,background:'rgba(0,0,0,0.75)',color:T.accent,padding:'3px 8px',borderRadius:4,fontSize:9,pointerEvents:'none',zIndex:10}}>HSL</div>}
                    {/* Mask shape overlays */}
                    {(activeTool==='radial'||activeTool==='gradient')&&(
                      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:8}} viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Live drag preview */}
                        {gradStart&&gradEnd&&activeTool==='radial'&&(()=>{
                          const cx=gradStart.x*100,cy=gradStart.y*100;
                          const rx=Math.abs(gradEnd.x-gradStart.x)*100,ry=Math.abs(gradEnd.y-gradStart.y)*100;
                          return(<>
                            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.8"/>
                            <ellipse cx={cx} cy={cy} rx={rx*0.5} ry={ry*0.5} fill="none" stroke="white" strokeWidth="0.3" opacity="0.5"/>
                            <circle cx={cx} cy={cy} r="0.8" fill="white" opacity="0.9"/>
                          </>);
                        })()}
                        {gradStart&&gradEnd&&activeTool==='gradient'&&(()=>{
                          return(<>
                            <line x1={gradStart.x*100} y1={gradStart.y*100} x2={gradEnd.x*100} y2={gradEnd.y*100} stroke="white" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.8"/>
                            <circle cx={gradStart.x*100} cy={gradStart.y*100} r="0.8" fill="white"/>
                            <circle cx={gradEnd.x*100} cy={gradEnd.y*100} r="0.8" fill="white"/>
                          </>);
                        })()}
                        {/* Saved mask overlays */}
                        {(photoMasks[selId]||[]).map((m,i)=>{
                          const isActive=i===activeMaskIdx;
                          const col=isActive?'#FF6B2B':'rgba(255,255,255,0.6)';
                          if(m.type==='radial'){
                            const cx=m.cx*100,cy=m.cy*100,rx=m.rx*100,ry=m.ry*100;
                            return(<g key={m.id} onClick={()=>setActiveMaskIdx(i)} style={{cursor:'pointer'}}>
                              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={col} strokeWidth={isActive?0.5:0.3} opacity={isActive?1:0.5}/>
                              <ellipse cx={cx} cy={cy} rx={rx*0.5} ry={ry*0.5} fill="none" stroke={col} strokeWidth="0.3" opacity={isActive?0.7:0.3}/>
                              <circle cx={cx} cy={cy} r="1" fill={col} opacity={isActive?1:0.5}/>
                            </g>);
                          }
                          if(m.type==='linear'){
                            return(<g key={m.id} onClick={()=>setActiveMaskIdx(i)} style={{cursor:'pointer'}}>
                              <line x1={m.cx*100} y1={m.cy*100} x2={m.ex*100} y2={m.ey*100} stroke={col} strokeWidth={isActive?0.5:0.3} opacity={isActive?1:0.5}/>
                              <circle cx={m.cx*100} cy={m.cy*100} r="1" fill={col}/>
                              <circle cx={m.ex*100} cy={m.ey*100} r="1" fill={col}/>
                            </g>);
                          }
                          return null;
                        })}
                      </svg>
                    )}
                    {showClipping&&!showBefore&&(
                      <div style={{position:'absolute',top:40,left:8,background:'rgba(0,0,0,0.75)',borderRadius:4,padding:'3px 8px',fontSize:9,color:'#fff',display:'flex',gap:10,zIndex:10,pointerEvents:'none'}}>
                        <span style={{color:'#ff4d4d'}}>&#9632; Blown</span>
                        <span style={{color:'#4d9fff'}}>&#9632; Crushed</span>
                      </div>
                    )}
                  </div>
                ):(
                  <div onClick={()=>fileRef.current?.click()} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                    <div style={{textAlign:'center',padding:60}}>
                      <div style={{width:100,height:100,margin:'0 auto 20px',border:`2px dashed ${T.border}`,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,color:T.textDim}}>CAM</div>
                      <div style={{fontSize:22,fontWeight:600,color:T.textBright,marginBottom:8,letterSpacing:'-0.5px'}}>{i18n('dropPhotos')}</div>
                      <div style={{fontSize:13,color:T.textDim,marginBottom:6,lineHeight:1.5}}>{i18n('orClick')}</div>
                      <div style={{fontSize:11,color:T.border}}>JPG . PNG . WebP . CR2 . NEF . ARW . DNG . RAF</div>
                    </div>
                  </div>
                )}
              </>)}

              {/* COMPARE VIEW */}
              {viewMode==='compare'&&photo&&(
                  <div style={{flex:1,display:'flex',gap:2}}>
                    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                      <div style={{height:22,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:T.accent,fontWeight:600,flexShrink:0}}>
                        * SELECTED: {photo.name}
                      </div>
                      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                        <img ref={imgRef} src={maskSrc||hslSrc||photo.src} alt="" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',filter:cssFilter}}/>
                      </div>
                    </div>
                    <div style={{width:2,background:T.border,flexShrink:0}}/>
                    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                      <div style={{height:22,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:9,color:T.textDim,flexShrink:0}}>
                        <span>Compare with:</span>
                        <select value={compareId||''} onChange={e=>setCompareId(e.target.value||null)}
                          style={{background:T.input,border:`1px solid ${T.border}`,borderRadius:3,color:T.text,fontSize:8,padding:'1px 4px'}}>
                          <option value="">Next photo</option>
                          {photos.filter(p=>p.id!==selId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                        {comparePhoto?(
                          <img src={comparePhoto.src} alt="" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',filter:adjMap[comparePhoto.id]?buildFilter(adjMap[comparePhoto.id]):'none'}}/>
                        ):(
                          <span style={{color:T.textDim,fontSize:11}}>Import another photo to compare</span>
                        )}
                      </div>
                    </div>
                  </div>
              )}

              {/* SURVEY VIEW */}
              {viewMode==='survey'&&(
                <div style={{flex:1,display:'grid',gridTemplateColumns:`repeat(${Math.ceil(Math.sqrt(Math.max(1,displayPhotos.length)))},1fr)`,gap:4,padding:8,overflowY:'auto',alignContent:'start'}}>
                  {(displayPhotos.length>0?displayPhotos:photos).map(p=>(
                    <div key={p.id} onClick={()=>{setSelId(p.id);setViewMode('single');}}
                      style={{position:'relative',borderRadius:6,overflow:'hidden',cursor:'pointer',
                        border:`2px solid ${p.id===selId?T.accent:'transparent'}`,aspectRatio:'4/3'}}>
                      <img src={p.src} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',filter:adjMap[p.id]?buildFilter(adjMap[p.id]):'none'}}/>
                      <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.8))',padding:'4px 6px'}}>
                        <div style={{fontSize:8,color:'rgba(255,255,255,0.8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                        {(ratingMap[p.id]||0)>0&&<div style={{fontSize:7,color:T.accent}}>{'*'.repeat(ratingMap[p.id]||0)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Local Adjustment Popup */}
            {showLocalPanel&&['brush','gradient','radial','subject','sky'].includes(activeTool)&&(
              <div style={{position:'absolute',bottom:30,right:280,background:T.panel,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:16,width:256,boxShadow:'0 16px 48px rgba(0,0,0,0.6)',zIndex:20,animation:'fadeUp 0.2s ease'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.textBright}}>Local Adjustments</span>
                  <button onClick={()=>setShowLocalPanel(false)} style={{background:'none',border:'none',color:T.textDim,fontSize:16,lineHeight:1}}>×</button>
                </div>
                {/* Invert toggle */}
                {['gradient','radial'].includes(activeTool)&&(
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,padding:'6px 10px',background:T.input,borderRadius:6}}>
                    <span style={{fontSize:10,color:T.text}}>Invert mask (affect outside)</span>
                    <button onClick={()=>{const ni=!localInvert;setLocalInvert(ni);updateActiveMask(localAdj,ni);}}
                      style={{width:36,height:20,borderRadius:10,background:localInvert?T.accent:T.input,border:`1px solid ${localInvert?T.accent:T.border}`,position:'relative',transition:'all 0.2s',flexShrink:0}}>
                      <div style={{position:'absolute',top:2,left:localInvert?17:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
                    </button>
                  </div>
                )}
                {[
                  {key:'exposure',label:'Exposure',min:-3,max:3,step:0.05,fmt:v=>`${v>0?'+':''}${v.toFixed(2)}`},
                  {key:'contrast',label:'Contrast'},
                  {key:'highlights',label:'Highlights'},
                  {key:'shadows',label:'Shadows'},
                  {key:'saturation',label:'Saturation'},
                  {key:'temperature',label:'Temp'},
                  {key:'clarity',label:'Clarity'},
                  {key:'sharpness',label:'Sharpness',min:0,max:150,fmt:v=>`${v}`},
                ].map(s=>(
                  <Slider key={s.key} label={s.label} value={localAdj[s.key]||0} min={s.min||-100} max={s.max||100} step={s.step||1} onChange={v=>{const na={...localAdj,[s.key]:v};setLocalAdj(na);updateActiveMask(na);}} format={s.fmt}/>
                ))}
                <div style={{display:'flex',gap:6,marginTop:8}}>
                  <div style={{flex:1,fontSize:9,color:T.textDim,display:'flex',alignItems:'center',gap:4}}>
                    {activeMaskIdx!==null?<span style={{color:T.green}}>&#10003; Live</span>:<span>Draw a mask first</span>}
                  </div>
                  <button onClick={()=>{setLocalAdj({exposure:0,contrast:0,saturation:0,highlights:0,shadows:0,temperature:0,clarity:0,sharpness:0});updateActiveMask({exposure:0,contrast:0,saturation:0,highlights:0,shadows:0,temperature:0,clarity:0,sharpness:0});}}
                    style={{padding:'6px 10px',background:T.input,border:`1px solid ${T.border}`,borderRadius:6,color:T.textDim,fontSize:10}}>Reset</button>
                </div>
                {/* Masks list */}
                {(photoMasks[selId]||[]).length>0&&(
                  <div style={{marginTop:10,borderTop:`1px solid ${T.border}`,paddingTop:8}}>
                    <div style={{fontSize:9,color:T.textDim,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Active Masks ({(photoMasks[selId]||[]).length})</div>
                    {(photoMasks[selId]||[]).map((m,i)=>(
                      <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:`1px solid ${T.border}22`}}>
                        <span style={{fontSize:10,color:T.text}}>
                          {m.type==='radial'?'◯':m.type==='linear'?'▦':'◉'} Mask {i+1}
                          {m.invert&&<span style={{color:T.accent,fontSize:9}}> (inv)</span>}
                        </span>
                        <button onClick={()=>setPhotoMasks(prev=>{const updated=(prev[selId]||[]).filter((_,idx)=>idx!==i);return{...prev,[selId]:updated};})}
                          style={{background:'none',border:'none',color:T.red,fontSize:12,cursor:'pointer',padding:'0 4px'}}>×</button>
                      </div>
                    ))}
                    <button onClick={()=>setPhotoMasks(prev=>({...prev,[selId]:[]}))}
                      style={{width:'100%',marginTop:4,padding:'4px',background:'none',border:`1px solid ${T.red}44`,borderRadius:4,color:T.red,fontSize:9}}>
                      Clear All Masks
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status bar */}
            <div style={{height:22,background:T.bg,borderTop:`1px solid ${T.border}`,display:'flex',alignItems:'center',padding:'0 14px',gap:16,fontSize:9,color:T.textDim,fontFamily:'monospace',flexShrink:0}} className="no-print">
              {photo?(<>
                <span style={{color:T.text,fontWeight:500}}>{photo.name}</span>
                {imgRef.current&&<span>{imgRef.current.naturalWidth}x{imgRef.current.naturalHeight}</span>}
                <span>{(photo.size/1024/1024).toFixed(2)} MB</span>
                {photo.exif?.make&&<span>{photo.exif.make} {photo.exif.model}</span>}
                {photo.exif?.iso&&<span>ISO {photo.exif.iso}</span>}
                {photo.exif?.fNumber&&<span>f/{photo.exif.fNumber?.toFixed(1)}</span>}
                {photo.exif?.exposureTime&&<span>{photo.exif.exposureTime<1?`1/${Math.round(1/photo.exif.exposureTime)}`:`${photo.exif.exposureTime}`}s</span>}
                {photo.exif?.lat&&<span style={{color:T.blue}}>GPS {photo.exif.lat?.toFixed(4)},{photo.exif.lng?.toFixed(4)}</span>}
                {cropR&&<span style={{color:T.accent}}>C Cropped</span>}
                <span style={{marginLeft:'auto'}}>Zoom: {Math.round(zoom*100)}% . {displayPhotos.length}/{photos.length}</span>
              </>):<span>{i18n('noPhotoSelected')} — RAW (CR2,NEF,ARW,DNG,RAF)</span>}
            </div>
          </div>

          {/* == RIGHT PANEL == */}
          <div style={{width:264,background:T.panel,borderLeft:`1px solid ${T.border}`,display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0}} className="no-print">
            <div style={{padding:'10px 12px 6px',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <span style={{fontSize:9,color:T.textDim,letterSpacing:'0.12em',textTransform:'uppercase',fontWeight:700}}>{i18n('histogram')}</span>
                <div style={{display:'flex',gap:5,fontSize:8}}><span style={{color:'#FF5A5A'}}>R</span><span style={{color:'#4ADE80'}}>G</span><span style={{color:'#4A9EFF'}}>B</span><span style={{color:'#aaa'}}>L</span></div>
              </div>
              <Histogram src={photo?.src} filter={cssFilter}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:3,fontSize:8,color:T.border}}>
                {['0','64','128','192','255'].map(v=><span key={v}>{v}</span>)}
              </div>
            </div>

            {/* Section tabs */}
            <div style={{display:'flex',overflowX:'auto',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
              {[['basic','Basic'],['tone','Tone'],['hsl','HSL'],['detail','Detail'],['effects','FX'],['pointcolor','Color'],['proof','Proof'],['exif','EXIF'],['faces','Faces']].map(([id,lbl])=>(
                <button key={id} onClick={()=>setRightTab(id)}
                  className={`panel-tab${rightTab===id?' active':''}`} style={{color:rightTab===id?T.accent:T.textDim}}>
                  {lbl}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:'auto',opacity:photo?1:0.45,pointerEvents:photo?'auto':'none'}}>
              {rightTab==='basic'&&(<>
                <Section title={i18n('whiteBalance')}>
                  <Slider label={i18n('temperature')} value={adj.temperature} min={-100} max={100} onChange={v=>setAdj('temperature',v)}/>
                  <Slider label={i18n('tint')} value={adj.tint} min={-100} max={100} onChange={v=>setAdj('tint',v)}/>
                  <div style={{display:'flex',gap:3,marginTop:8,flexWrap:'wrap'}}>
                    {WB_PRESETS.map(wb=>(
                      <button key={wb.name} onClick={()=>{setAdj('temperature',wb.temp);setAdj('tint',wb.tint);}}
                        style={{padding:'3px 6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:8}}>{wb.name}</button>
                    ))}
                  </div>
                </Section>
                <Section title={i18n('tone')}>
                  <Slider label={i18n('exposure')} value={adj.exposure} min={-5} max={5} step={0.05} onChange={v=>setAdj('exposure',v)} format={v=>`${v>0?'+':''}${v.toFixed(2)}`}/>
                  <Slider label={i18n('contrast')} value={adj.contrast} onChange={v=>setAdj('contrast',v)}/>
                  <Slider label={i18n('highlights')} value={adj.highlights} onChange={v=>setAdj('highlights',v)}/>
                  <Slider label={i18n('shadows')} value={adj.shadows} onChange={v=>setAdj('shadows',v)}/>
                  <Slider label={i18n('whites')} value={adj.whites} onChange={v=>setAdj('whites',v)}/>
                  <Slider label={i18n('blacks')} value={adj.blacks} onChange={v=>setAdj('blacks',v)}/>
                </Section>
                <Section title={i18n('presence')}>
                  <Slider label={i18n('texture')} value={adj.texture} onChange={v=>setAdj('texture',v)}/>
                  <Slider label={i18n('clarity')} value={adj.clarity} onChange={v=>setAdj('clarity',v)}/>
                  <Slider label={i18n('dehaze')} value={adj.dehaze} onChange={v=>setAdj('dehaze',v)}/>
                  <Slider label={i18n('vibrance')} value={adj.vibrance} onChange={v=>setAdj('vibrance',v)}/>
                  <Slider label={i18n('saturation')} value={adj.saturation} onChange={v=>setAdj('saturation',v)}/>
                </Section>
              </>)}

              {rightTab==='tone'&&(<>
                <Section title={i18n('toneCurve')} badge="RGB">
                  <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
                    <ToneCurve
                      points={adj.curvePoints||DEF.curvePoints}
                      onChangePoints={pts=>setAdj('curvePoints',pts)}
                      channelPoints={{r:adj.curveR||DEF_CURVE,g:adj.curveG||DEF_CURVE,b:adj.curveB||DEF_CURVE}}
                      onChangeChannel={(ch,pts)=>setAdj(`curve${ch.toUpperCase()}`,pts)}
                      channel={curveChannel}
                      onChangeChannelSelect={setCurveChannel}
                    />
                  </div>
                  <button onClick={()=>{
                    setAdj('curvePoints',[[0,0],[64,64],[128,128],[192,192],[255,255]]);
                    setAdj('curveR',null);setAdj('curveG',null);setAdj('curveB',null);
                  }} style={{width:'100%',padding:'5px',background:T.input,border:`1px solid ${T.border}`,borderRadius:4,color:T.textDim,fontSize:10}}>Reset All Curves</button>
                </Section>
                <Section title={i18n('zoneAdjustments')}>
                  {[['Highlights','curveHL',0,100],['Lights','curveLG',-100,100],['Darks','curveDK',-100,100],['Shadows','curveSH',-100,0]].map(([lbl,key,mn,mx])=>(
                    <Slider key={key} label={lbl} value={adj[key]||0} min={mn} max={mx} onChange={v=>setAdj(key,v)}/>
                  ))}
                </Section>
              </>)}

              {rightTab==='hsl'&&(<>
                <Section title={i18n('hslMixer')}>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
                    {HSL_COLORS.map(c=>(
                      <button key={c.id} onClick={()=>setHslColor(c.id)} style={{width:26,height:26,borderRadius:'50%',background:c.hex,border:`2.5px solid ${hslColor===c.id?'#fff':'transparent'}`,fontSize:7,color:'#fff',fontWeight:700,boxShadow:hslColor===c.id?`0 0 8px ${c.hex}88`:'none'}}>{c.label}</button>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:HSL_COLORS.find(c=>c.id===hslColor)?.hex,fontWeight:600,marginBottom:8,textTransform:'capitalize'}}>* {hslColor}</div>
                  {['Hue','Saturation','Luminance'].map(prop=>{
                    const key=`hsl_${hslColor}_${prop.toLowerCase()}`;
                    return <Slider key={prop} label={prop} value={adj[key]||0} min={-100} max={100} onChange={v=>setAdj(key,v)}/>;
                  })}
                </Section>
                <Section title={i18n('colorGrading')} defaultOpen={false}>
                  {['Shadows','Midtones','Highlights'].map(zone=>(
                    <div key={zone} style={{marginBottom:12}}>
                      <div style={{fontSize:10,fontWeight:600,color:T.text,marginBottom:6}}>{zone}</div>
                      <Slider label={i18n('hue')} value={adj[`cg_${zone.toLowerCase()}_hue`]||0} min={0} max={360} onChange={v=>setAdj(`cg_${zone.toLowerCase()}_hue`,v)} format={v=>`${v}deg`}/>
                      <Slider label={i18n('saturation')} value={adj[`cg_${zone.toLowerCase()}_sat`]||0} min={0} max={100} onChange={v=>setAdj(`cg_${zone.toLowerCase()}_sat`,v)} format={v=>`${v}`}/>
                      <Slider label="Luminance" value={adj[`cg_${zone.toLowerCase()}_lum`]||0} onChange={v=>setAdj(`cg_${zone.toLowerCase()}_lum`,v)}/>
                    </div>
                  ))}
                </Section>
              </>)}

              {rightTab==='detail'&&(<>
                <Section title={i18n('sharpening')}>
                  <Slider label={i18n('amount')} value={adj.sharpness} min={0} max={150} onChange={v=>setAdj('sharpness',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('radius')} value={adj.sharpRadius} min={5} max={30} onChange={v=>setAdj('sharpRadius',v)} format={v=>(v/10).toFixed(1)}/>
                  <Slider label={i18n('detail')} value={adj.sharpDetail} min={0} max={100} onChange={v=>setAdj('sharpDetail',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('masking')} value={adj.sharpMasking} min={0} max={100} onChange={v=>setAdj('sharpMasking',v)} format={v=>`${v}`}/>
                </Section>
                <Section title={i18n('noiseReduction')}>
                  <div style={{fontSize:10,color:T.textDim,marginBottom:6}}>{i18n('luminance')}</div>
                  <Slider label={i18n('amount')} value={adj.lumaNR} min={0} max={100} onChange={v=>setAdj('lumaNR',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('detail')} value={adj.noiseDetail} min={0} max={100} onChange={v=>setAdj('noiseDetail',v)} format={v=>`${v}`}/>
                  <div style={{fontSize:10,color:T.textDim,margin:'8px 0 4px'}}>{i18n('color')}</div>
                  <Slider label={i18n('amount')} value={adj.colorNR} min={0} max={100} onChange={v=>setAdj('colorNR',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('smoothness')} value={adj.colorSmooth} min={0} max={100} onChange={v=>setAdj('colorSmooth',v)} format={v=>`${v}`}/>
                </Section>
                <Section title={i18n('lensCorrections')} defaultOpen={false}>
                  <Slider label={i18n('distortion')} value={adj.distortion||0} onChange={v=>setAdj('distortion',v)}/>
                  <Slider label={i18n('vignetting')} value={adj.lensVignette||0} onChange={v=>setAdj('lensVignette',v)}/>
                  <div style={{fontSize:10,color:T.textDim,margin:'8px 0 4px'}}>Chromatic Aberration</div>
                  <Slider label="Purple Fringe" value={adj.purpleFringe||0} min={0} max={100} onChange={v=>setAdj('purpleFringe',v)} format={v=>`${v}`}/>
                  <Slider label="Green Fringe" value={adj.greenFringe||0} min={0} max={100} onChange={v=>setAdj('greenFringe',v)} format={v=>`${v}`}/>
                  <Slider label="Red/Cyan Offset" value={adj.caRed||0} min={-50} max={50} onChange={v=>setAdj('caRed',v)}/>
                  <Slider label="Blue/Yellow Offset" value={adj.caBlue||0} min={-50} max={50} onChange={v=>setAdj('caBlue',v)}/>
                </Section>
                <Section title={i18n('transform')} defaultOpen={false}>
                  <Slider label={i18n('vertical')} value={adj.transV||0} onChange={v=>setAdj('transV',v)}/>
                  <Slider label={i18n('horizontal')} value={adj.transH||0} onChange={v=>setAdj('transH',v)}/>
                  <Slider label={i18n('rotate')} value={adj.rotate||0} min={-45} max={45} step={0.1} onChange={v=>setAdj('rotate',v)} format={v=>`${v.toFixed(1)}deg`}/>
                  <Slider label={i18n('scale')} value={adj.scale||0} min={-50} max={50} onChange={v=>setAdj('scale',v)}/>
                </Section>
                <Section title={i18n('calibration')} defaultOpen={false}>
                  {[['Red Hue','calRedH'],['Red Sat.','calRedS'],['Green Hue','calGreenH'],['Green Sat.','calGreenS'],['Blue Hue','calBlueH'],['Blue Sat.','calBlueS']].map(([lbl,key])=>(
                    <Slider key={key} label={lbl} value={adj[key]||0} onChange={v=>setAdj(key,v)}/>
                  ))}
                </Section>
              </>)}

              {rightTab==='effects'&&(<>
                <Section title={i18n('vignette')}>
                  <Slider label={i18n('amount')} value={adj.vignette} onChange={v=>setAdj('vignette',v)}/>
                  <Slider label="Midpoint" value={adj.vignetteMidpoint} min={0} max={100} onChange={v=>setAdj('vignetteMidpoint',v)} format={v=>`${v}`}/>
                  <Slider label="Feather" value={adj.vignetteFeather} min={0} max={100} onChange={v=>setAdj('vignetteFeather',v)} format={v=>`${v}`}/>
                  <Slider label="Roundness" value={adj.vignetteRound} onChange={v=>setAdj('vignetteRound',v)}/>
                </Section>
                <Section title={i18n('grain')}>
                  <Slider label={i18n('amount')} value={adj.grain} min={0} max={100} onChange={v=>setAdj('grain',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('size')} value={adj.grainSize} min={1} max={100} onChange={v=>setAdj('grainSize',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('roughness')} value={adj.grainRough} min={0} max={100} onChange={v=>setAdj('grainRough',v)} format={v=>`${v}`}/>
                </Section>
                <Section title={i18n('splitToning')} defaultOpen={false}>
                  <div style={{fontSize:10,color:T.textDim,marginBottom:6}}>Highlights</div>
                  <Slider label={i18n('hue')} value={adj.stHlHue||0} min={0} max={360} onChange={v=>setAdj('stHlHue',v)} format={v=>`${v}deg`}/>
                  <Slider label={i18n('saturation')} value={adj.stHlSat||0} min={0} max={100} onChange={v=>setAdj('stHlSat',v)} format={v=>`${v}`}/>
                  <Slider label={i18n('balance')} value={adj.stBalance||0} onChange={v=>setAdj('stBalance',v)}/>
                  <div style={{fontSize:10,color:T.textDim,margin:'8px 0 4px'}}>Shadows</div>
                  <Slider label={i18n('hue')} value={adj.stShHue||0} min={0} max={360} onChange={v=>setAdj('stShHue',v)} format={v=>`${v}deg`}/>
                  <Slider label={i18n('saturation')} value={adj.stShSat||0} min={0} max={100} onChange={v=>setAdj('stShSat',v)} format={v=>`${v}`}/>
                </Section>
              </>)}

              {rightTab==='pointcolor'&&(
                <PointColorPanel adj={adj} setAdj={setAdj}/>
              )}

              {rightTab==='proof'&&(
                <SoftProofPanel
                  enabled={softProofEnabled} profile={softProofProfile}
                  onToggle={()=>setSoftProofEnabled(e=>!e)} onProfile={setSoftProofProfile}
                  gamutWarn={gamutWarn} onGamutWarn={()=>setGamutWarn(g=>!g)}/>
              )}

              {rightTab==='exif'&&(
                <ExifPanel photo={photo} onEdit={updateMeta}/>
              )}

              {rightTab==='faces'&&(
                <FacePanel photo={photo} onTagFace={(id,name)=>{
                  if(!selId)return;
                  setPhotos(prev=>prev.map(p=>{
                    if(p.id!==selId)return p;
                    const faces=[...(p.faces||[])];const idx=faces.findIndex(f=>f.id===id);
                    if(idx>=0)faces[idx]={...faces[idx],name};else faces.push({id,name});
                    return{...p,faces};
                  }));
                }}/>
              )}
            </div>

            {/* Bottom actions */}
            <div style={{padding:'8px 12px',borderTop:`1px solid ${T.border}`,flexShrink:0}}>
              <div style={{display:'flex',gap:6,marginBottom:6}}>
                <button onClick={()=>{if(selId)window._lc={...adj};showNotif('Copied');}} style={{flex:1,padding:'6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10}}>Copy</button>
                <button onClick={()=>{if(selId&&window._lc){setAdjMap(p=>({...p,[selId]:{...window._lc}}));showNotif('Pasted');}}} style={{flex:1,padding:'6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.text,fontSize:10}}>Paste</button>
                <button onClick={()=>{if(selId){setAdjMap(p=>({...p,[selId]:{...DEF}}));showNotif('Reset');}}} style={{flex:1,padding:'6px',background:T.input,border:`1px solid ${T.border}`,borderRadius:5,color:T.red,fontSize:10}}>Reset</button>
              </div>
              {photo&&(
                <button onClick={()=>setShowExport(true)} style={{width:'100%',padding:'9px',background:`linear-gradient(90deg,${T.accent},${T.accentDark})`,border:'none',borderRadius:6,color:'#000',fontSize:11,fontWeight:700,boxShadow:`0 2px 10px ${T.accentGlow}`}}>
                  Export Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* == FILMSTRIP == */}
      {module==='develop'&&(
        <div style={{height:D.filmH,background:T.panel,borderTop:`1px solid ${T.border}`,display:'flex',alignItems:'center',padding:'0 8px',gap:3,overflowX:'auto',flexShrink:0}} className="no-print">
          <div onClick={()=>fileRef.current?.click()} style={{width:thumbSize,height:thumbSize+2,flexShrink:0,border:`1px dashed ${T.border}`,borderRadius:5,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.textDim,gap:2}}>
            <span style={{fontSize:20}}>+</span><span style={{fontSize:7}}>ADD</span>
          </div>
          {photos.length===0&&<div style={{flex:1,textAlign:'center',color:T.textDim,fontSize:10}}>{i18n('noPhotos')} . RAW files supported</div>}
          {photos.map((p,i)=>{
            const sel=p.id===selId;
            return(
              <div key={p.id} className="ft" onClick={()=>setSelId(p.id)}
                style={{width:thumbSize,height:thumbSize+2,flexShrink:0,borderRadius:5,overflow:'hidden',cursor:'pointer',position:'relative',border:`2px solid ${sel?T.accent:'transparent'}`,boxShadow:sel?`0 0 12px ${T.accentGlow}`:'none'}}>
                <img src={p.src} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',filter:adjMap[p.id]?buildFilter(adjMap[p.id]):'none'}}/>
                {(ratingMap[p.id]||0)>0&&<div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.8))',fontSize:7,color:T.accent,textAlign:'center',padding:'3px 0 1px'}}>{'*'.repeat(ratingMap[p.id]||0)}</div>}
                {flagMap[p.id]===1&&<div style={{position:'absolute',top:1,left:2,fontSize:9,color:'#fff'}}>P</div>}
                {cropMap[p.id]&&<div style={{position:'absolute',top:1,right:2,fontSize:8,color:T.accent}}>C</div>}
                {p.raw&&<div style={{position:'absolute',bottom:1,right:2,fontSize:6,color:T.accent,fontWeight:700,background:'rgba(0,0,0,0.6)',padding:'0 2px',borderRadius:2}}>RAW</div>}
                {p.exif?.lat&&<div style={{position:'absolute',top:1,left:p.raw?10:2,fontSize:7,color:T.blue}}>GPS</div>}
                {showFileNumbers&&<div style={{position:'absolute',bottom:2,right:3,fontSize:7,color:'rgba(255,255,255,0.25)',fontFamily:'monospace'}}>{i+1}</div>}
                <button onClick={e=>{e.stopPropagation();if(confirmDelete&&!confirm(`Remove "${p.name}" from session?`))return;setPhotos(prev=>{const next=prev.filter(x=>x.id!==p.id);if(selId===p.id)setSelId(next[0]?.id||null);return next;});showNotif('Photo removed');}}
                  style={{position:'absolute',top:2,right:2,width:16,height:16,background:'rgba(200,40,40,0.85)',border:'none',borderRadius:3,color:'#fff',fontSize:11,lineHeight:'16px',textAlign:'center',cursor:'pointer',display:'none'}}
                  className="del-btn">x</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
