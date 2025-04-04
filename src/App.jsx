// src/App.js
import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { 
  ThumbsUp, Share2, Twitter, Facebook, Instagram, 
  Download, Copy, ChevronRight, Globe, ArrowRight 
} from 'lucide-react';

const BoycottApp = () => {
  // State'ler
  const [participants, setParticipants] = useState(0);
  const [todayJoined, setTodayJoined] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinNumber, setJoinNumber] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('katil');
  const [instagramTipVisible, setInstagramTipVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // İyileştirilmiş görsel indirme fonksiyonu - Masaüstü ve mobil için
  const downloadImage = (imageUrl, fileName) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobil cihazlar için, görseli yeni bir sekmede aç
      // Bu, kullanıcıların tarayıcının yerel arayüzünü kullanarak galerilerine kaydetmelerini sağlar
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title>Boykot Kartı</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; font-family: Arial, sans-serif; }
                img { max-width: 100%; height: auto; margin-bottom: 20px; }
                .instructions { padding: 15px; text-align: center; background: white; border-radius: 8px; margin: 0 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                h3 { margin-top: 0; }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" alt="Boykot Kartı" />
              <div class="instructions">
                <h3>Görseli Kaydetmek İçin:</h3>
                <p>Görsele uzun basın ve "Görseli Kaydet" seçeneğini seçin.</p>
              </div>
            </body>
          </html>
        `);
        newTab.document.close();
      }
    } else {
      // Masaüstü için geleneksel indirme
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName || 'boykot-karti.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Paylaş sayfası render edilmeden önce cihaz kontrolü yap
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Firestore'daki global istatistikleri gerçek zamanlı dinliyoruz
  useEffect(() => {
    const globalRef = doc(firestore, 'stats', 'global');
    const unsubscribe = onSnapshot(globalRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setParticipants(data.participants || 0);
        setTodayJoined(data.todayJoined || 0);
        setActiveDays(data.activeDays || 0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Katılım işlemi
  const handleJoin = async () => {
    if (!hasJoined) {
      const globalRef = doc(firestore, 'stats', 'global');
      try {
        await runTransaction(firestore, async (transaction) => {
          const docSnap = await transaction.get(globalRef);
          if (!docSnap.exists()) {
            transaction.set(globalRef, {
              participants: 1,
              todayJoined: 1,
              activeDays: 1 // Kampanya başlangıcı
            });
            setJoinNumber(1);
          } else {
            const currentParticipants = docSnap.data().participants || 0;
            const currentTodayJoined = docSnap.data().todayJoined || 0;
            const newParticipants = currentParticipants + 1;
            const newTodayJoined = currentTodayJoined + 1;
            transaction.update(globalRef, {
              participants: newParticipants,
              todayJoined: newTodayJoined
            });
            setJoinNumber(newParticipants);
          }
        });
        setHasJoined(true);
        setTimeout(() => setActiveTab('paylas'), 800);
      } catch (error) {
        console.error("Katılım güncellenirken hata oluştu: ", error);
      }
    }
  };

  // Kişiye özel renk üretme fonksiyonu (katılımcı numarasına göre)
  const getPersonalColor = (number) => {
    // Temel renk seçenekleri - zarif ve modern
    const colors = [
      '#FF0000', // Kırmızı
      '#0066CC', // Mavi
      '#009688', // Turkuaz
      '#673AB7', // Mor
      '#FF5722', // Turuncu
      '#795548', // Kahverengi
      '#607D8B', // Gri-Mavi
      '#E91E63', // Pembe
      '#4CAF50', // Yeşil
      '#FF9800'  // Amber
    ];
    
    // Katılımcı numarasına göre bir renk seç (tutarlı olması için mod kullan)
    const colorIndex = number % colors.length;
    return colors[colorIndex];
  };

  // Zarif çizgiler çizme fonksiyonu
  const drawElegantLines = (ctx, width, height, color) => {
    // Çizgi kalınlığı
    const lineWidth = 2;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    
    // Yukarıdan ve aşağıdan ince yatay çizgiler
    const margin = 100; // Kenarlardan uzaklık
    const lineLength = width - (margin * 2); // Çizgi uzunluğu
    
    // Üst çizgi
    ctx.beginPath();
    ctx.moveTo(margin, height * 0.15);
    ctx.lineTo(margin + lineLength, height * 0.15);
    ctx.stroke();
    
    // Alt çizgi
    ctx.beginPath();
    ctx.moveTo(margin, height * 0.85);
    ctx.lineTo(margin + lineLength, height * 0.85);
    ctx.stroke();
    
    // Köşelerde zarif detaylar - üst
    const cornerSize = 30; // Köşe detayı boyutu
    
    // Sol üst köşe
    ctx.beginPath();
    ctx.moveTo(margin, height * 0.15 + cornerSize);
    ctx.lineTo(margin, height * 0.15);
    ctx.lineTo(margin + cornerSize, height * 0.15);
    ctx.stroke();
    
    // Sağ üst köşe
    ctx.beginPath();
    ctx.moveTo(margin + lineLength - cornerSize, height * 0.15);
    ctx.lineTo(margin + lineLength, height * 0.15);
    ctx.lineTo(margin + lineLength, height * 0.15 + cornerSize);
    ctx.stroke();
    
    // Sol alt köşe
    ctx.beginPath();
    ctx.moveTo(margin, height * 0.85 - cornerSize);
    ctx.lineTo(margin, height * 0.85);
    ctx.lineTo(margin + cornerSize, height * 0.85);
    ctx.stroke();
    
    // Sağ alt köşe
    ctx.beginPath();
    ctx.moveTo(margin + lineLength - cornerSize, height * 0.85);
    ctx.lineTo(margin + lineLength, height * 0.85);
    ctx.lineTo(margin + lineLength, height * 0.85 - cornerSize);
    ctx.stroke();
  };

  // Görsel önizleme modalı bileşeni - Güncellenmiş indirme fonksiyonu ile
  const ImagePreviewModal = ({ isVisible, onClose, imageUrl }) => {
    if (!isVisible) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Görsel Önizleme</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="relative">
            <img src={imageUrl} alt="Boykot Kartı" className="w-full h-auto rounded-lg" />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={() => downloadImage(imageUrl, 'boykot-karti.jpg')}
                className="bg-white text-gray-800 px-4 py-2 rounded-md shadow-md hover:bg-gray-100 flex items-center"
              >
                <Download size={16} className="mr-2" />
                İndir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // kart oluşturma ve paylaşım işlemi - geliştirilmiş, cihaz tipine göre farklı davranış
  const handleShareWithBadge = async (platform) => {
    try {
      // kart metnini oluştur
      const badgeText = `Ben de\nBOYKOTA KATILDIM\n#${activeDays}. Gün\n${participants} kişiyiz\nboykot-kampanya.vercel.app`;
      
      // kart görselini oluştur
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Instagram hikaye boyutları (9:16 oranı)
      canvas.width = 1080;
      canvas.height = 1920;
      
      // Minimal beyaz arka plan
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Kişiye özel renk oluştur (her kullanıcı için farklı)
      const personalColor = getPersonalColor(joinNumber || participants);
      
      // İnce ve zarif çizgiler ekle
      drawElegantLines(ctx, canvas.width, canvas.height, personalColor);
      
      // Metin hizalama ayarları
      ctx.textAlign = 'center';
      
      // BEN DE yazısı - Kişiye özel renkli
      ctx.fillStyle = personalColor;
      ctx.font = 'bold 90px Montserrat, Arial, sans-serif';
      ctx.fillText('BEN DE', canvas.width/2, canvas.height * 0.25);
      
      // BOYKOTA yazısı - Siyah, ultra kalın
      ctx.fillStyle = '#000000';
      ctx.font = '900 150px Montserrat, Arial, sans-serif';
      ctx.fillText('BOYKOTA', canvas.width/2, canvas.height * 0.35);
      
      // KATILDIM yazısı - Siyah, ultra kalın
      ctx.fillStyle = '#000000';
      ctx.font = '900 150px Montserrat, Arial, sans-serif';
      ctx.fillText('KATILDIM', canvas.width/2, canvas.height * 0.45);
      
      // Gün bilgisi - Kişiye özel renkli
      ctx.fillStyle = personalColor;
      ctx.font = 'bold 80px Montserrat, Arial, sans-serif';
      ctx.fillText(`#${activeDays}. GÜN`, canvas.width/2, canvas.height * 0.58);
      
      // Kişi sayısı - Siyah, büyük ve bold
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 90px Montserrat, Arial, sans-serif';
      ctx.fillText(`${participants} KİŞİYİZ`, canvas.width/2, canvas.height * 0.68);

      // Görseli base64 formatına çevir
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      
      // Paylaşım işlemi - platform türüne göre
      switch(platform) {
        case 'instagram-mobile': {
          setPreviewImage(dataUrl);
          setInstagramTipVisible(true);
          break;
        }
        
        case 'instagram-desktop': {
          // Masaüstünde doğrudan indir
          downloadImage(dataUrl, 'boykot-karti.jpg');
          // Bilgi mesajı
          alert('Instagram\'da paylaşmak için görseli indirdikten sonra Instagram web sitesine veya uygulamasına yükleyebilirsiniz.');
          break;
        }
          
        case 'download':
          // Görseli önizleme modalında göster
          setPreviewImage(dataUrl);
          return dataUrl; // doğrudan indirme için dataUrl'i döndür
          
        case 'copy':
          // Görseli ve metni panoya kopyala
          navigator.clipboard.writeText(badgeText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          });
          break;
          
        default:
          if (navigator.share) {
            navigator.share({
              title: 'Boykot Kampanyası',
              text: badgeText,
              url: 'https://boykot-kampanya.vercel.app'
            });
          }
      }
      
      return dataUrl; // Hepsinde dataUrl döndürelim
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      return null;
    }
  };
  
  // Instagram paylaşım modalı - Kompakt ve işlevsel tasarım
  const InstagramTipModal = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 flex flex-col max-h-[90vh] overflow-hidden">
          {/* Sabit başlık */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-1.5 rounded-md mr-2">
                <Instagram size={18} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Instagram'da Paylaş</h3>
            </div>
            <button 
              onClick={onClose} 
              className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
            >
              <span className="text-gray-600 font-bold">✕</span>
            </button>
          </div>
          
          {/* Scrollable içerik */}
          <div className="overflow-y-auto p-4 flex-grow">
            <p className="text-gray-600 mb-3 text-sm">
              Oluşturduğunuz kartı Instagram hikayenizde paylaşarak boykota destek olun.
            </p>
            
            {/* Kompakt hikaye paylaşımı rehberi */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 shadow-sm">
              <h4 className="text-gray-700 font-semibold mb-2 text-sm">PAYLAŞIM ADIMLAR</h4>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Kartı İndirin</p>
                    <p className="text-gray-600 text-xs">
                      Aşağıdaki "Kartı İndir" butonuna dokunun
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Instagram'ı Açın</p>
                    <p className="text-gray-600 text-xs">
                      Telefonunuzdan Instagram uygulamasına geçin
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Hikaye Oluşturun</p>
                    <p className="text-gray-600 text-xs">
                      Sol üstteki profil fotoğrafınıza dokunup "Hikaye" seçin
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-xs">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Galeriden Seçin</p>
                    <p className="text-gray-600 text-xs">
                      Sol altta galeri simgesine dokunup kartı seçin
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-xs">
                    5
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Bağlantı Ekleyin</p>
                    <p className="text-gray-600 text-xs">
                      Üst menüdeki "Aa" butonuna dokunup aşağıdaki adresi yazın:
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bağlantı ve kopyalama butonu - Kompakt */}
            <div className="bg-gray-50 border border-gray-200 rounded-md py-2 px-3 mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">boykot-kampanya.vercel.app</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('boykot-kampanya.vercel.app');
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded border border-gray-300 transition-colors flex items-center"
              >
                <Copy size={12} className="mr-1" />
                {copySuccess ? 'Kopyalandı!' : 'Kopyala'}
              </button>
            </div>
          </div>
          
          {/* Sabit alt butonlar */}
          <div className="flex justify-between p-4 border-t border-gray-100">
            <button
              onClick={() => downloadImage(previewImage, 'boykot-karti.jpg')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-md hover:from-purple-700 hover:to-pink-600 transition-colors flex items-center font-medium"
            >
              <Download size={16} className="mr-2" />
              Kartı İndir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sosyal medya paylaşım işlemi - Düzeltilmiş Instagram desteği ile
  const handleShare = (platform) => {
    const shareText = `#Boykot kampanyasına ben de katıldım! ${participants.toLocaleString()} kişiyiz ve büyüyoruz. Sen de katıl:`;
    const shareUrl = 'https://boykot-kampanya.vercel.app';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'instagram':
        if (isMobile) {
          // Mobil cihazlarda Instagram uygulamasına yönlendirmeyi dene
          handleShareWithBadge('instagram-mobile');
        } else {
          // Masaüstünde doğrudan görseli indirmeyi öner
          handleShareWithBadge('instagram-desktop');
        }
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Boykot Kampanyası',
            text: shareText,
            url: shareUrl
          });
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="font-bold text-xl text-gray-800">BOYKOT</span>
            </div>
            <div className="hidden md:block">
              <div className="flex space-x-4">
                <button onClick={() => setActiveTab('katil')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab==='katil' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Katıl
                </button>
                <button onClick={() => setActiveTab('paylas')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab==='paylas' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Paylaş
                </button>
              </div>
            </div>
            <div className="md:hidden flex">
              <div className="flex justify-between w-full">
                <button onClick={() => setActiveTab('katil')} className={`flex flex-col items-center justify-center px-4 ${activeTab==='katil' ? 'text-red-600' : 'text-gray-600'}`}>
                  <span className="text-xs">Katıl</span>
                </button>
                <button onClick={() => setActiveTab('paylas')} className={`flex flex-col items-center justify-center px-4 ${activeTab==='paylas' ? 'text-red-600' : 'text-gray-600'}`}>
                  <span className="text-xs">Paylaş</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Canlı Sayaç */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 text-white text-center">
            <div className="flex flex-col justify-center">
              <div className="font-bold text-lg sm:text-xl md:text-2xl">{participants.toLocaleString()}</div>
              <div className="text-xs sm:text-sm">kişi katıldı</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="font-bold text-lg sm:text-xl md:text-2xl">+{todayJoined}</div>
              <div className="text-xs sm:text-sm">bugün</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="font-bold text-lg sm:text-xl md:text-2xl">{activeDays}</div>
              <div className="text-xs sm:text-sm">gün</div>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik Alanı */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-grow">
        {activeTab === 'katil' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="md:flex min-h-[500px]">
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Boykot Hareketine Katılın
                  </h1>
                  <p className="text-gray-600 mb-8 md:pr-12">
                    Hareket, tüketici gücünü birleştirmek amacıyla anonim katılımla başlatıldı.
                  </p>
                  {!hasJoined ? (
                    <button 
                      onClick={handleJoin}
                      className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white py-4 px-8 font-medium text-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 w-full md:w-auto"
                    >
                      Şimdi Katıl
                      <ArrowRight className="ml-2" size={20} />
                    </button>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-2 mb-2">
                        <ThumbsUp className="text-green-600" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-green-800 mb-2">Teşekkürler!</h3>
                      <p className="text-green-700 mb-4">
                        Sen {joinNumber ? joinNumber.toLocaleString() : 0}. destekçi oldun.
                      </p>
                      <button 
                        onClick={() => setActiveTab('paylas')}
                        className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white py-2 px-4 font-medium transition-all duration-200"
                      >
                        Paylaşarak Güçlendir
                        <Share2 className="ml-2" size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="md:w-1/2 bg-gradient-to-br from-red-600 to-red-800 p-8 md:py-12 md:px-8 text-white flex flex-col justify-center">
                  <div className="rounded-lg bg-white bg-opacity-10 backdrop-blur-sm p-6">
                    <h3 className="font-bold text-xl mb-3">Temel Hedefler</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ChevronRight size={18} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>Kolektif tüketici gücünü göstermek ve dayanışmayı artırmak</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight size={18} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>Tam gizlilik sağlayarak herkesin güvenle katılımını sağlamak</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight size={18} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>Kampanyanın büyüyen etkisini şeffaf biçimde görselleştirmek</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'paylas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
                <h2 className="text-xl font-bold mb-2 text-center">Boykotu Yaygınlaştır</h2>
                <p className="text-center opacity-90 max-w-md mx-auto">
                  Daha fazla kişiye ulaşarak boykotun etkisini artırmada yardımcı olun
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Sosyal Medyada Paylaş</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button onClick={() => handleShare('twitter')} className="flex items-center justify-center bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-md transition-all duration-200">
                        <Twitter size={18} className="mr-2" />
                        Twitter'da Paylaş
                      </button>
                      <button onClick={() => handleShare('facebook')} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200">
                        <Facebook size={18} className="mr-2" />
                        Facebook'ta Paylaş
                      </button>
                      <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-all duration-200">
                        <Share2 size={18} className="mr-2" />
                        WhatsApp'ta Paylaş
                      </button>
                      {isMobile && (
                        <button onClick={() => handleShare('instagram')} className="flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-md transition-all duration-200">
                          <Instagram size={18} className="mr-2" />
                          Instagram'da Paylaş
                        </button>
                      )}
                    </div>
                    
                  </div>
                  <div>
                    <div className="bg-white border-2 border-gray-200 text-center p-6 rounded-md mb-4">
                      <div className="text-sm text-red-600 font-bold mb-1">BEN DE</div>
                      <div className="text-2xl font-bold text-black mb-1">BOYKOTA KATILDIM</div>
                      <div className="text-sm text-red-600 mt-2">#{activeDays}. GÜN</div>
                      <div className="text-lg font-bold text-black mt-1">{participants} KİŞİYİZ</div>
                    </div>
                    {isMobile && (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={async () => {
                            // Görseli önce oluştur
                            const dataUrl = await handleShareWithBadge('download');
                            if (dataUrl) {
                              // Ardından indir
                              downloadImage(dataUrl, 'boykot-karti.jpg');
                            }
                          }}
                          className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200"
                        >
                          <Download size={16} className="mr-2" />
                          Görseli İndir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-2">
            <span>BOYKOT KAMPANYA</span>
          </div>
          <p className="text-sm opacity-70">
            © 2025 · Hiçbir kişisel veri toplanmaz veya depolanmaz · Tüm katılımlar anonimdir
          </p>
        </div>
      </footer>

      {/* Görsel Önizleme Modal */}
      <ImagePreviewModal 
        isVisible={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
      />

      {/* Instagram Tip Modal */}
      {instagramTipVisible && (
        <InstagramTipModal 
          isVisible={instagramTipVisible} 
          onClose={() => setInstagramTipVisible(false)}
        />
      )}
    </div>
  );
};

export default BoycottApp;