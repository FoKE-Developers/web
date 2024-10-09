import styled from '@emotion/styled';

const StyledIframe = styled.iframe({
  width: '100%',
  height: '100vh',
  border: 0,
  padding: 0,
});

export default function AboutPage() {
  return (
    <StyledIframe src="https://www.notioniframe.com/notion/7did5nhyric"></StyledIframe>
  );
}
