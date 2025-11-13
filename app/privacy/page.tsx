'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
            <p>
              Bem-vindo à SimonApps. Nos comprometemos em proteger sua privacidade e garantir que você tenha uma experiência positiva em nossa plataforma. Esta Política de Privacidade descreve como coletamos, usamos, divulgamos e protegemos suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
            <p className="mb-3">Coletamos informações que você fornece diretamente, incluindo:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Nome, endereço de email e senha para criar sua conta</li>
              <li>Informações de perfil e configurações da sua empresa</li>
              <li>Números de telefone e contatos dos clientes</li>
              <li>Mensagens e conteúdo compartilhado através da plataforma</li>
              <li>Informações de pagamento e faturamento</li>
              <li>Dados de uso e comportamento na plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Como Usamos Suas Informações</h2>
            <p className="mb-3">Utilizamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar transações e enviar notificações relacionadas</li>
              <li>Responder a suas solicitações e fornecer suporte ao cliente</li>
              <li>Enviar atualizações sobre novos recursos e políticas</li>
              <li>Proteger contra fraude e atividades não autorizadas</li>
              <li>Analisar tendências de uso para melhorar nossos serviços</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Segurança de Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas, administrativas e físicas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia de dados em trânsito e em repouso, autenticação segura e controles de acesso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Compartilhamento de Informações</h2>
            <p className="mb-3">Suas informações podem ser compartilhadas com:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornecedores de serviços que nos ajudam a operar nossa plataforma</li>
              <li>Autoridades legais quando exigido por lei</li>
              <li>Parceiros de negócios para melhorar nossos serviços</li>
              <li>Sua equipe e usuários autorizados em sua conta</li>
            </ul>
            <p className="mt-3">
              Nunca venderemos suas informações pessoais a terceiros sem seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Retenção de Dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, os dados podem ser retidos por um período adicional conforme exigido por lei, para fins de backup ou para fins legítimos de negócios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Seus Direitos</h2>
            <p className="mb-3">Você tem o direito de:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir informações imprecisas</li>
              <li>Solicitar a exclusão de suas informações</li>
              <li>Optar por não receber comunicações de marketing</li>
              <li>Solicitar uma cópia de seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p>
              Utilizamos cookies para melhorar sua experiência, manter você conectado e coletar dados analíticos. Você pode controlar as configurações de cookies através do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Conformidade Legal</h2>
            <p>
              Estamos comprometidos em cumprir todas as leis aplicáveis de proteção de dados, incluindo LGPD (Lei Geral de Proteção de Dados) e GDPR (Regulamento Geral de Proteção de Dados).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos você sobre alterações significativas por email ou através de um aviso em nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contato</h2>
            <p>
              Se tiver dúvidas sobre esta Política de Privacidade ou sobre como seus dados são tratados, entre em contato conosco através de suporte@simonapps.shop
            </p>
          </section>

          <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
