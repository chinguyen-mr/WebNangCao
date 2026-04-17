const BrandStory = () => {
  return (
    <div className="brand-story">
      <div className="brand-story-container">
        <h2>Di Sản Xa Hoa Của Chúng Tôi</h2>

        <div className="story-content">
          {/* Left panel — decorative identity block */}
          <div className="story-image">
            <div style={{
              width: '100%',
              height: '100%',
              minHeight: '380px',
              background: 'linear-gradient(160deg, #3D2F23 0%, #4B3621 40%, #6B5040 70%, #C6A769 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--background-color)',
              textAlign: 'center',
              padding: '3rem',
            }}>
              <div style={{
                fontSize: '0.75rem',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: 'var(--accent-color)',
                marginBottom: '1.5rem',
              }}>
                Thành Lập
              </div>
              <div style={{
                fontSize: '3.5rem',
                fontFamily: 'Georgia, serif',
                fontWeight: '300',
                letterSpacing: '2px',
                marginBottom: '1.5rem',
                color: 'rgba(249, 246, 241, 0.9)',
              }}>
                2004
              </div>
              <div style={{
                width: '40px',
                height: '1px',
                background: 'var(--accent-color)',
                marginBottom: '1.5rem',
              }} />
              <p style={{
                fontSize: '0.9rem',
                lineHeight: '1.9',
                color: 'rgba(249, 246, 241, 0.75)',
                maxWidth: '240px',
              }}>
                Nhà Tuyển Chọn Trầm Hương Cao Cấp<br />
                Từ Những Nguồn Gốc Tinh Túy Nhất
              </p>
            </div>
          </div>

          {/* Right panel — story text */}
          <div className="story-text">
            <h3>Nghệ Thuật Trầm Hương Đỉnh Cao</h3>
            <p>
              Hơn hai thập kỷ qua, chúng tôi đã tuyển chọn những sản phẩm trầm hương
              tinh túy nhất từ các nguồn độc quyền trên khắp Đông Nam Á. Cam kết không
              ngừng về chất lượng, tính xác thực và bền vững định hình từng sản phẩm
              trong bộ sưu tập được gìn giữ cẩn thận của chúng tôi.
            </p>

            <div className="story-highlight">
              <div className="story-highlight-icon">✓</div>
              <div className="story-highlight-text">
                <strong>100% Nguồn Gốc Xác Thực</strong>
                Chúng tôi thu mua trực tiếp từ các nhà trồng trọt và nhà sưu tầm được
                chứng nhận, đảm bảo tính xác thực và minh bạch hoàn toàn.
              </div>
            </div>

            <div className="story-highlight">
              <div className="story-highlight-icon">✓</div>
              <div className="story-highlight-text">
                <strong>Tuyển Chọn Bởi Bậc Thầy</strong>
                Mỗi sản phẩm được lựa chọn trực tiếp bởi đội ngũ chuyên gia trầm hương
                với hàng thập kỷ kinh nghiệm tổng hợp.
              </div>
            </div>

            <div className="story-highlight">
              <div className="story-highlight-icon">✓</div>
              <div className="story-highlight-text">
                <strong>Xuất Sắc Bền Vững</strong>
                Chúng tôi cam kết với các phương pháp khai thác đạo đức và bảo tồn môi
                trường vì các thế hệ tương lai.
              </div>
            </div>

            <p>
              Dù bạn là người sành sỏi hay đang khám phá thế giới trầm hương xa hoa lần
              đầu, bộ sưu tập của chúng tôi mang đến điều phi thường cho mọi gu thưởng
              thức tinh tế. Hãy trải nghiệm sự khác biệt mà chất lượng tạo nên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandStory;
