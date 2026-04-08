import { Component } from 'react';

const ITEMS = [
  {
    symbol: '❧',
    title: 'Nguồn Gốc Thiên Nhiên',
    description: 'Được thu hoạch từ những khu rừng trầm hương cao cấp tại Đông Nam Á, mỗi sản phẩm mang trong mình di sản tự nhiên hàng thế kỷ.'
  },
  {
    symbol: '◈',
    title: 'Thủ Công Bậc Thầy',
    description: 'Chế tác thủ công bởi các nghệ nhân chuyên gia sử dụng kỹ thuật truyền thống được truyền qua nhiều thế hệ.'
  },
  {
    symbol: '✦',
    title: 'Chất Lượng Xác Thực',
    description: 'Mỗi sản phẩm trải qua kiểm định chất lượng nghiêm ngặt để đảm bảo hương thơm vượt trội và độ bền lâu dài.'
  },
  {
    symbol: '◇',
    title: 'Xứng Đáng Làm Quà',
    description: 'Được đóng gói tinh tế trong bao bì cao cấp, hoàn hảo cho những ai trân trọng sự sang trọng và thanh lịch đích thực.'
  }
];

class CraftsmanshipComponent extends Component {
  render() {
    return (
      <section className="craftsmanship-section">
        <h2>Tại Sao Chọn Trầm Tịnh</h2>
        <div className="craftsmanship-grid">
          {ITEMS.map((item, index) => (
            <div key={index} className="craftsmanship-item">
              <div className="craftsmanship-icon"
                style={{ fontFamily: 'Georgia, serif', color: 'var(--accent-color)' }}>
                {item.symbol}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
}

export default CraftsmanshipComponent;
