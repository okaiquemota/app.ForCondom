-- Cenários de RLS do ForCondom. Rode SÓ em banco descartável (cria dados de teste) com a
-- migração aplicada (ex.: `supabase start` e depois
-- `psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" -f supabase/tests/rls.sql`).
-- Os ERRORs são esperados (tentativas bloqueadas); os SELECTs mostram o que cada usuário enxerga.
--   A = síndica do condomínio 1, B = moradora que entra pelo convite, C = outro condomínio.
\set ON_ERROR_STOP 0
insert into auth.users (id, instance_id, aud, role, email) values ('aaaaaaaa-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000000','authenticated','authenticated','a@x'),('bbbbbbbb-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000000','authenticated','authenticated','b@x'),('cccccccc-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000000','authenticated','authenticated','c@x');
set role authenticated;
-- A cria condomínio
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000000';
select criar_condominio('Residencial Sol','SP','Ana','2','1504','11999998888') is not null as a_criou;
select codigo_convite as cod from condominios \gset
insert into anuncios (autor_id,tipo,categoria,titulo,preco_centavos) values (auth.uid(),'produto','Bolos','Bolo de cenoura',4500);
-- C cria outro condomínio
set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000000';
select criar_condominio('Outro','RJ','Caio','1','10',null) is not null as c_criou;
select count(*) as c_ve_anuncios_de_a from anuncios;
select count(*) as c_ve_perfis_publicos from perfis_publicos;
-- B entra pendente
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000000';
select entrar_condominio(:'cod','Bia','3','202','') is not null as b_entrou;
select count(*) as b_pendente_ve_anuncios from anuncios;
insert into anuncios (autor_id,tipo,categoria,titulo) values (auth.uid(),'servico','Manicure','Manicure em casa');
update perfis set status='aprovado' where id=auth.uid();
select status as b_status_apos_tentar_se_aprovar from perfis where id=auth.uid();
-- A aprova B
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000000';
select moderar_morador('bbbbbbbb-0000-0000-0000-000000000000','aprovado');
-- B aprovado
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000000';
select count(*) as b_ve_anuncios from anuncios;
select nome, torre, apto, total_recomendacoes from perfis_publicos order by nome;
select count(*) as b_le_tabela_perfis_de_a from perfis where id='aaaaaaaa-0000-0000-0000-000000000000';
insert into recomendacoes (autor_id, vendedor_id, texto) values (auth.uid(),'aaaaaaaa-0000-0000-0000-000000000000','Bolo ótimo!');
insert into recomendacoes (autor_id, vendedor_id) values (auth.uid(),'cccccccc-0000-0000-0000-000000000000');
insert into recomendacoes (autor_id, vendedor_id) values (auth.uid(),auth.uid());
update anuncios set titulo='hack' where autor_id='aaaaaaaa-0000-0000-0000-000000000000';
select titulo as titulo_apos_hack from anuncios where autor_id='aaaaaaaa-0000-0000-0000-000000000000';
insert into avisos (autor_id,titulo,corpo) values (auth.uid(),'Aviso falso','x');
insert into denuncias (autor_id, anuncio_id, motivo) select auth.uid(), id, 'preço abusivo' from anuncios where autor_id='aaaaaaaa-0000-0000-0000-000000000000';
insert into anuncios (autor_id,tipo,categoria,titulo) values ('aaaaaaaa-0000-0000-0000-000000000000','produto','x','impersonado');
-- A modera
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000000';
select count(*) as a_ve_denuncias from denuncias;
update anuncios set status='removido' where autor_id='bbbbbbbb-0000-0000-0000-000000000000';
insert into avisos (autor_id,titulo,corpo) values (auth.uid(),'Bem-vindos','Mural do condomínio');
-- B tenta reativar
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000000';
update anuncios set status='ativo' where autor_id=auth.uid();
select status as b_anuncio_status from anuncios where autor_id=auth.uid();
select count(*) as b_le_mural from avisos;
-- C não vê mural de A
set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000000';
select count(*) as c_le_mural_de_a from avisos;
select moderar_morador('bbbbbbbb-0000-0000-0000-000000000000','bloqueado');
