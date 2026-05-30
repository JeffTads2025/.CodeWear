import { FiPhone, FiMapPin, FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import * as S from './styles';

export function Footer() {
  const instagramUrl = "https://www.instagram.com/grupointegrado/";
  const facebookUrl = "https://www.facebook.com/grupointegrado";
  const phoneNumber = '(44) 3518-2500';
  const whatsappUrl = 'https://wa.me/554435182500';
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Av.+Irm%C3%A3os+Pereira%2C+670+-+Centro%2C+Campo+Mour%C3%A3o+-+PR';

  return (
    <S.Container>
      <S.ContentWrapper>
        <S.Content>
          {/* 1. Endereço e Telefone */}
          <S.Contact>
            <ul>
              <li>
                <FiPhone size={14} />
                <a href={`tel:${phoneNumber.replace(/\D/g, '')}`}>
                  <span>{phoneNumber}</span>
                </a>
              </li>
              <li><FiMapPin size={14} /> <span>Av. Irmãos Pereira, 670 - Centro</span></li>
            </ul>
          </S.Contact>

          {/* 2. Botão do Mapa (Logo após o endereço) */}
          <S.MapSection>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <FiMapPin size={14} />
              <span>Ver no Mapa</span>
            </a>
          </S.MapSection>

          {/* 3. Redes Sociais (Após a divisória) */}
          <S.Social>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp size={20} />
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <FiInstagram size={20} />
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
              <FiFacebook size={20} />
            </a>
          </S.Social>
        </S.Content>

        {/* Linha de baixo: Copyright Centralizado */}
        <S.Copyright>
          <p>© 2026 CodeWear | Grupo Integrado. Todos os direitos reservados.</p>
        </S.Copyright>
      </S.ContentWrapper>
    </S.Container>
  );
}