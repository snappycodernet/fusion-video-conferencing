import styled from '@emotion/styled'

const NotFoundRoot = styled.div(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    height: '100vh',
}))

const NotFound = () => {
  return (
    <NotFoundRoot>
        <h1>... THERE AIN'T NUTHIN HERE ...</h1>
    </NotFoundRoot>
  )
}

export default NotFound